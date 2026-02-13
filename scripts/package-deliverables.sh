#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root_dir"

mkdir -p deliverables

python - <<'PY'
from pathlib import Path
import zipfile

root_dir = Path('.').resolve()
deliverables_dir = root_dir / 'deliverables'

exclude_roots = {
    'deliverables',
    'preview-screenshots',
    'live-preview',
    'node_modules',
    'dist',
    '.git',
}

exclude_filenames = {
    'preview-590x300.png',
    'preview-590x300.jpg',
    'thumbnail-80x80.png',
}


def should_exclude(path: Path) -> bool:
    try:
        relative = path.relative_to(root_dir)
    except ValueError:
        return True

    if not relative.parts:
        return False

    if relative.parts[0] in exclude_roots:
        return True

    if relative.name in exclude_filenames:
        return True

    return False


def create_zip(zip_path: Path, source_path: Path) -> None:
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        if source_path.is_file():
            zipf.write(source_path, source_path.name)
            return

        for file_path in source_path.rglob('*'):
            if file_path.is_dir():
                continue
            arcname = file_path.relative_to(source_path)
            zipf.write(file_path, arcname)


def create_buyer_zip(zip_path: Path) -> None:
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in root_dir.rglob('*'):
            if file_path.is_dir():
                continue
            if should_exclude(file_path):
                continue
            arcname = file_path.relative_to(root_dir)
            zipf.write(file_path, arcname)


# Legacy names
create_buyer_zip(deliverables_dir / 'warungwa-buyer.zip')
create_zip(deliverables_dir / 'warungwa-preview-screenshots.zip', root_dir / 'preview-screenshots')
create_zip(deliverables_dir / 'warungwa-live-preview.zip', root_dir / 'live-preview')

# Marketplace-generic names
create_buyer_zip(deliverables_dir / 'buyer-files.zip')
create_zip(deliverables_dir / 'preview-screenshots.zip', root_dir / 'preview-screenshots')
create_zip(deliverables_dir / 'live-preview.zip', root_dir / 'live-preview')
PY

echo "Done. ZIP files are available in ./deliverables"
