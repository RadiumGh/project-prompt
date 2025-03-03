# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2023-09-12

### Added

- Automatic port discovery feature to find available ports when the default or specified port is already in use
- Port availability checking before starting the server
- Improved feedback when falling back to a different port

### Changed

- Updated CLI help message to document the automatic port fallback behavior
- Enhanced server startup sequence to handle port conflicts gracefully

## [1.1.0] - 2023-09-11

### Added

- Custom port option (`--port` or `-p`) to CLI to allow running on ports other than the default 3000
- Updated documentation to include the new port option
- Enhanced error handling for port conflicts

### Changed

- Improved CLI help message to show the new port option
- Updated README.md with examples of using the custom port option

## [1.0.1] - 2023-09-10

### Added

- Installation script to setup CLI permissions during npm install
- Created API usage examples
- Added comprehensive API documentation

### Changed

- Updated package.json to include postinstall script
- Enhanced CLI execution permissions handling

## [1.0.0] - 2023-09-09

### Added

- Initial release
- CLI for running Project Prompt with a specified project directory
- Web interface for selecting files, creating custom instructions, and generating prompts
- JSON-based file changes API
- Directory tree visualization
- Custom instructions management
- Light/Dark theme support
