"""Exact-identity comparison; ambiguous keys are quarantined, never paired."""
from __future__ import annotations

from collections import defaultdict

from app.data_review import identify_report
from app.tabular_import import ImportRejected, Table, analyze, identity_key


def compare(left: Table, left_meta: dict, right: Table, right_meta: dict,
            left_mapping: dict | None = None, right_mapping: dict | None = None) -> dict:
    a, am = analyze(left, left_meta, left_mapping)
    b, bm = analyze(right, right_meta, right_mapping)
    for field in ('nature', 'namespace'):
        if a['provenance'][field] != b['provenance'][field]:
            raise ImportRejected('incompatible_sources_' + field)
    if (left_meta['classification'] == 'synthetic') != (right_meta['classification'] == 'synthetic'):
        raise ImportRejected('synthetic_and_non_synthetic_must_not_be_compared')
    key = 'codlog' if left_meta['nature'] == 'street_registry' else 'ibge_code'
    fields = sorted((am.keys() & bm.keys()) - {key})
    if not fields:
        raise ImportRejected('no_common_comparison_fields')
    def index(table, mapping):
        result = defaultdict(list)
        missing = []
        for line, row in enumerate(table.rows, 2):
            value = identity_key(row[mapping[key]])
            if value is None:
                missing.append(line)
            else:
                result[value].append((line, row))
        return result, missing
    ai, ax = index(left, am)
    bi, bx = index(right, bm)
    review = []
    counts = dict(match=0, conflict=0, incomplete=0, only_left=0, only_right=0, ambiguous=0, missing_key=len(ax) + len(bx))
    for side, rows in [('left', ax), ('right', bx)]:
        for row in rows:
            review.append({'rule': 'MISSING_IDENTITY', side + '_rows': [row], 'fields': [key], 'state': 'PENDING'})
    for value in sorted(ai.keys() | bi.keys()):
        ar, br = ai.get(value, []), bi.get(value, [])
        refs = {'left_rows': [r[0] for r in ar], 'right_rows': [r[0] for r in br]}
        if len(ar) > 1 or len(br) > 1:
            counts['ambiguous'] += 1
            review.append({**refs, 'rule': 'DUPLICATE_IDENTITY_NO_PAIRING', 'fields': [key], 'state': 'PENDING'})
        elif not ar or not br:
            counts['only_left' if ar else 'only_right'] += 1
            review.append({**refs, 'rule': 'UNPAIRED_IDENTITY', 'fields': [key], 'state': 'PENDING'})
        else:
            different, missing = [], []
            for field in fields:
                av, bv = ar[0][1].get(am[field]), br[0][1].get(bm[field])
                if av is None or bv is None or not str(av).strip() or not str(bv).strip():
                    missing.append(field)
                elif str(av).strip() != str(bv).strip():
                    different.append(field)
            # Never remove accents or expand abbreviations to decide equality.
            category = 'conflict' if different else 'incomplete' if missing else 'match'
            counts[category] += 1
            if different or missing:
                review.append({**refs, 'rule': 'EXACT_VALUE_DIFFERENCE' if different else 'MISSING_COMPARISON_VALUE',
                               'fields': different, 'missing_fields': missing, 'state': 'PENDING'})
    # A matching subset does not erase defects elsewhere in either input, such as
    # missing unmapped cells or colliding headers. Reference the source report
    # rather than duplicating its contents or leaking cell values.
    for side, source in (('left', a), ('right', b)):
        if source['quality_status'] != 'PASS':
            review.append({'rule': 'SOURCE_QUALITY_ISSUES', 'side': side,
                           'source_report_id': source['report_id'], 'state': 'PENDING'})
    return identify_report({'contract_version': '1', 'sources': [a, b], 'compared_fields': fields, 'metrics': counts,
            'review_queue': review, 'writes_performed': False, 'official_validity': 'UNKNOWN',
            'quality_status': 'FAIL' if review else 'PASS',
            'row_reference': '1-based logical table row including header; blank rows omitted',
            'notice': 'Exact identifiers in caller-declared namespace; review only, no official corrections.'})
