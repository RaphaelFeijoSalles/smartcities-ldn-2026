import json

from app.data_import_cli import main, snhis_example


def test_real_historical_snapshot_derivation_without_recapture_claim():
    report = snhis_example()
    assert report['profile']['row_count'] == 1
    assert report['provenance']['reference_date'] == '2026-10-20'
    assert report['provenance']['classification'] == 'official_claimed'
    assert report['provenance']['verification'] == 'UNVERIFIED'
    assert report['official_validity'] == 'UNKNOWN'
    assert report['lineage']['original_download_verified_this_run'] is False
    assert report['lineage']['original_xls_sha256_claimed'].startswith('7a482e8')
    assert report == snhis_example()


def test_cli_report_export(capsys):
    assert main(['snhis-example']) == 0
    report = json.loads(capsys.readouterr().out)
    assert report['contract_version'] == '1'
    assert report['writes_performed'] is False


def test_cli_safe_error(capsys):
    assert main(['profile', '--left', '/not-found', '--left-metadata', '/not-found']) == 2
    captured = capsys.readouterr()
    assert '/not-found' not in captured.err
    assert json.loads(captured.err)['status'] == 'FAIL'
