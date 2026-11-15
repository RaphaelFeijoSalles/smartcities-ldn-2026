import pytest

from app.data_quality import canonical_header, profile_rows


def test_headers_normalize_and_collisions_are_reported_without_overwrite():
    rows = [{"Endereço": "Rua 1", "Endereco": "Rua 2", "CODLOG": "23"}]
    report = profile_rows(rows, source="SIGLON", reference_date="2026-11-14")
    assert canonical_header("  Código do Logradouro ") == "codigo_do_logradouro"
    assert report["column_mapping"]["Endereço"] == "endereco"
    assert report["header_collisions"] == {"endereco": ["Endereço", "Endereco"]}
    assert report["requires_human_review"] is True


def test_blank_and_missing_fields_not_mistaken_for_duplicate():
    rows = [{"id": "A", "endereco": ""}, {"id": "A", "endereco": "R. 1"}, {"id": "", "endereco": None}, {"id": None}]
    report = profile_rows(rows, source="TEST:synthetic", key_fields=["id"])
    assert report["duplicate_key_rows"] == 1
    assert report["incomplete_key_rows"] == 2
    assert report["missing_by_column"]["endereco"] == 3
    assert "R. 1" not in str(report)


def test_empty_input_is_safe_and_source_required():
    report = profile_rows([], source="TEST")
    assert report["row_count"] == report["column_count"] == 0
    assert report["requires_human_review"] is False
    with pytest.raises(ValueError):
        profile_rows([], source="  ")


def test_unknown_key_is_rejected_not_silently_ignored():
    with pytest.raises(ValueError):
        profile_rows([{"x": 1}], source="TEST", key_fields=["missing"])


def test_missing_nonkey_field_alone_requires_review():
    report = profile_rows([{'id': '1', 'observation': ''}], source='SYNTHETIC', key_fields=['id'])
    assert report['requires_human_review'] is True
