# Project Prompt CLI

A Next.js-powered CLI tool that helps you generate AI prompts from your local project files. This tool provides a web interface for selecting files, creating custom instructions, and generating combined prompts for AI tools. It also supports applying JSON-based code changes to your files via a server-side API.

## Installation

### Global Installation (Recommended)

```bash
npm install -g project-prompt-cli
```

### Local Installation

```bash
npm install project-prompt-cli
```

## Usage

### Starting the Interface

To start Project Prompt with your project directory:

```bash
# If installed globally
pjp run /path/to/your/project

# If installed locally
npx pjp run /path/to/your/project

# Use the current directory as project root
pjp run .

# Use a custom port (if 3000 is already in use)
pjp run . --port 3001
# OR
pjp run . -p 3001
```

This will start a Next.js server on http://localhost:3000 (or your specified port) that provides a web interface for interacting with your project files.

### CLI Commands

- `pjp run <project-dir> [options]` - Start Project Prompt with the specified project directory
- `pjp help` - Show usage instructions
- `pjp version` - Show version information

### CLI Options

- `--port, -p <port>` - Specify the port to run on (default: 3000)

## Features

- **Directory Selection**: Browse and select your project files and directories
- **File Loading**: Filter files using ignore patterns, select specific files or folders
- **Custom Instructions**: Create, edit, reorder, or toggle additional instruction blocks
- **Prompt Generation**: Combine instructions, custom instructions, and file contents
- **JSON-based File Changes**: Apply code changes to your local files through the web UI
- **Light/Dark Themes**: Toggle between visual themes
- **Port Configuration**: Specify a custom port if the default port is in use

## Usage Flow

1. **Start the CLI** with your project directory
2. **Open the Web Interface** at http://localhost:3000 (or your specified port)
3. **Select Files** you want to include in your prompt
4. **Add Custom Instructions** if needed
5. **Generate and Copy** the final prompt for use with AI tools
6. Optionally **Apply Code Changes** through the "Apply Changes" modal

## Advanced Configuration

Configuration settings are stored in `~/pjp-config.json` and automatically updated when you use the web interface.

## Security Notes

- The tool only makes file system changes within the specified project directory
- Path sanitization prevents file operations outside the base directory
- All file operations occur server-side through the Node.js API

## Contributing

Contributions are welcome! See the development section below for more information.

## Development

1. **Clone** the repository:
   ```bash
   git clone https://github.com/yourusername/project-prompt-cli.git
   cd project-prompt-cli
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run in development mode**:
   ```bash
   npm run dev
   ```
4. **Build the package**:
   ```bash
   npm run build
   ```

## License

Distributed under the AGPL v3 license. See the LICENSE file for details.
