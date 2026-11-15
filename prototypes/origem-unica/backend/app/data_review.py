"""Deterministic review receipts. No persistent audit, cell edits or legal decisions."""
from __future__ import annotations

import copy
import hashlib
import json


class ReviewRejected(ValueError):
    pass


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False, allow_nan=False).encode()).hexdigest()


def identify_report(report: dict) -> dict:
    base = {k: v for k, v in report.items() if k != 'report_id'}
    base['review_queue'] = [{k: v for k, v in item.items() if k != 'item_id'} for item in report['review_queue']]
    report_id = digest(base)
    queue = [{**item, 'item_id': digest({'report_id': report_id, 'item': item})} for item in base['review_queue']]
    return {**base, 'report_id': report_id, 'review_queue': queue}


def review(report: dict, expected_report_id: str, decisions: list) -> dict:
    if not isinstance(expected_report_id, str) or expected_report_id != report['report_id']:
        raise ReviewRejected('stale_or_different_report')
    if not isinstance(decisions, list) or not 1 <= len(decisions) <= 256:
        raise ReviewRejected('decisions_limit_1_to_256')
    available = {item['item_id'] for item in report['review_queue']}
    selected = {}
    for decision in decisions:
        if not isinstance(decision, dict) or set(decision) != {'item_id', 'resolution'}:
            raise ReviewRejected('invalid_review_decision')
        item_id, resolution = decision['item_id'], decision['resolution']
        if not isinstance(item_id, str) or item_id not in available or item_id in selected:
            raise ReviewRejected('unknown_or_repeated_review_item')
        if not isinstance(resolution, str) or resolution not in {'ACKNOWLEDGED_DIFFERENCE', 'REQUEST_SOURCE_CHECK', 'DEFERRED'}:
            raise ReviewRejected('invalid_review_resolution')
        selected[item_id] = resolution
    result = copy.deepcopy(report)
    for item in result['review_queue']:
        if item['item_id'] in selected:
            item['resolution'] = selected[item['item_id']]
            item['state'] = 'ACKNOWLEDGED' if item['resolution'] == 'ACKNOWLEDGED_DIFFERENCE' else 'PENDING'
    result['review_receipt'] = {
        'report_id': report['report_id'],
        'decisions': [{'item_id': k, 'resolution': selected[k]} for k in sorted(selected)],
        'persistence': 'NONE_EXPORT_ONLY',
        'actor_identity_verified': False,
        'notice': 'Client-declared review; no corrections, official approvals or persisted audit.',
    }
    result['review_receipt']['receipt_id'] = digest(result['review_receipt'])
    result['review_summary'] = {
        'total': len(result['review_queue']),
        'acknowledged': sum(item['state'] == 'ACKNOWLEDGED' for item in result['review_queue']),
        'pending': sum(item['state'] == 'PENDING' for item in result['review_queue']),
    }
    # quality_status, metrics, evidence, provenance and source bytes remain unchanged.
    return result
