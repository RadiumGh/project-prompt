import { ThemeOptions } from '@mui/material';

// <ai_context>
// TODO: Next rewriting plan: We'll incorporate or adapt this MUI config in Next's app/layout or separate provider.
//  Defines MUI theme configurations for light and dark modes,
//  balancing the gold color so it's less eye-catching (slightly darker).
//  Also removing primary color usage for textfield focus outlines.
//  Now ensures html,body,#root have height:100% via CssBaseline.
// </ai_context>

export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light' as const,
    primary: {
      main: '#E6C100'
    },
    background: {
      default: '#ffffff',
      paper: '#f0f0f0'
    }
  },
  shape: {
    borderRadius: 6
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: '100%',
          overflow: 'hidden'
        },
        body: {
          height: '100%',
          margin: 0,
          padding: 0,
          overflow: 'hidden'
        },
        '#root': {
          height: '100%',
          overflow: 'hidden'
        },
        '*': {
          scrollbarWidth: 'thin'
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px'
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
          border: '2px solid transparent',
          backgroundClip: 'content-box'
        },
        '*:hover::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 0.5
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#888 !important'
          }
        }
      }
    }
  }
}

export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark' as const,
    primary: {
      main: '#E6C100'
    },
    background: {
      default: '#181818',
      paper: '#2b2b2b'
    }
  },
  shape: {
    borderRadius: 6
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: '100%',
          overflow: 'hidden'
        },
        body: {
          height: '100%',
          margin: 0,
          padding: 0,
          overflow: 'hidden'
        },
        '#root': {
          height: '100%',
          overflow: 'hidden'
        },
        '*': {
          scrollbarWidth: 'thin'
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px'
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          border: '2px solid transparent',
          backgroundClip: 'content-box'
        },
        '*:hover::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.4)'
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 0.5
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#888 !important'
          }
        }
      }
    }
  }
}
