# Branch Structure

## Main Branch

The repository now has a `main` branch which serves as the default/stable branch for the project.

## Default Branch

Previously, the repository used a feature branch as its default. The repository structure has been normalized to use `main` as the primary branch going forward.

## Development Workflow

- `main`: Stable production-ready code
- Feature branches: `feature/description` or `cto/description`
- All feature branches should be merged into `main` via pull requests

## Migration Notes

The repository previously lacked a standard `main` branch reference. This has been addressed by creating a `main` branch from the existing codebase state (commit a8ab4a9).

## Setting Default Branch

After this PR is merged, repository administrators should:
1. Set `main` as the default branch in GitHub repository settings
2. Update branch protection rules as needed
3. Archive or remove old feature branches that are no longer needed
