
// <ai_context>
// TODO: Next rewriting plan: Evaluate if we fully switch to MUI theming or keep a styled-components approach in Next. Possibly unify both.
//  Defines two themes (light and dark) for styled-components.
//  Now includes inputBg for textareas/inputs in dark/light modes.
// </ai_context>

export const lightTheme = {
  background: '#ffffff',
  text: '#000000',
  headerBg: '#f0f0f0',
  buttonBg: '#007acc',
  buttonText: '#ffffff',
  border: '#dddddd',
  inputBg: '#f4f4f4'
}

export const darkTheme = {
  background: '#181818',
  text: '#ffffff',
  headerBg: '#282828',
  buttonBg: '#444444',
  buttonText: '#ffffff',
  border: '#555555',
  inputBg: '#2b2b2b'
}
