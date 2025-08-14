import { createTheme, Theme } from "@mui/material/styles";

// Fresh Dog Agility Theme - Modern and Clean
const primary = "#2E7D32"; // Forest green - represents agility courses and nature
const primaryLight = "#4CAF50"; // Light green
const primaryDark = "#1B5E20"; // Dark green
const secondary = "#1976D2"; // Blue - represents trust and reliability
const secondaryLight = "#42A5F5"; // Light blue
const secondaryDark = "#0D47A1"; // Dark blue

// Neutral and accent colors
const background = "#FAFBFC"; // Very light blue-gray
const surface = "#FFFFFF"; // Pure white
const accent = "#FF6F00"; // Warm orange for highlights
const accentLight = "#FFB74D"; // Light orange

const AGILITY_THEME: Theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: primary,
      light: primaryLight,
      dark: primaryDark,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: secondary,
      light: secondaryLight,
      dark: secondaryDark,
      contrastText: "#FFFFFF",
    },
    text: {
      primary: "#1A1A1A", // Deep black for excellent readability
      secondary: "#424242", // Dark gray for secondary text
    },
    background: {
      default: background,
      paper: surface,
    },
    action: {
      hover: "rgba(46, 125, 50, 0.04)",
      selected: "rgba(46, 125, 50, 0.08)",
      active: "rgba(46, 125, 50, 0.12)",
    },
    divider: "rgba(0, 0, 0, 0.08)",
    success: {
      main: "#2E7D32", // Green for successful entries
      light: "#4CAF50",
      dark: "#1B5E20",
    },
    error: {
      main: "#D32F2F", // Red for errors
      light: "#EF5350",
      dark: "#C62828",
    },
    warning: {
      main: "#ED6C02", // Orange for warnings
      light: "#FF9800",
      dark: "#E65100",
    },
    info: {
      main: "#0288D1", // Blue for info
      light: "#03A9F4",
      dark: "#01579B",
    },
  },
  typography: {
    fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      color: "#1A1A1A",
      letterSpacing: "-0.02em",
      fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
      color: "#1A1A1A",
      letterSpacing: "-0.01em",
      fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.3,
      color: "#1A1A1A",
      letterSpacing: "-0.01em",
      fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#1A1A1A",
      letterSpacing: "-0.01em",
      fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#1A1A1A",
      letterSpacing: "-0.01em",
      fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#1A1A1A",
      letterSpacing: "-0.01em",
      fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      color: "#1A1A1A",
      fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      color: "#424242",
      fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "0.875rem",
      letterSpacing: "0.01em",
      fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.4,
      color: "#424242",
      fontWeight: 500,
      fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 600,
      lineHeight: 1.4,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "#424242",
      fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    "none",
    "0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)",
    "0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)",
    "0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)",
    "0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22)",
    "0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)",
    "0px 24px 48px rgba(0, 0, 0, 0.35), 0px 20px 15px rgba(0, 0, 0, 0.22)",
    "0px 29px 58px rgba(0, 0, 0, 0.40), 0px 25px 18px rgba(0, 0, 0, 0.22)",
    "0px 34px 68px rgba(0, 0, 0, 0.45), 0px 30px 21px rgba(0, 0, 0, 0.22)",
    "0px 39px 78px rgba(0, 0, 0, 0.50), 0px 35px 24px rgba(0, 0, 0, 0.22)",
    "0px 44px 88px rgba(0, 0, 0, 0.55), 0px 40px 27px rgba(0, 0, 0, 0.22)",
    "0px 49px 98px rgba(0, 0, 0, 0.60), 0px 45px 30px rgba(0, 0, 0, 0.22)",
    "0px 54px 108px rgba(0, 0, 0, 0.65), 0px 50px 33px rgba(0, 0, 0, 0.22)",
    "0px 59px 118px rgba(0, 0, 0, 0.70), 0px 55px 36px rgba(0, 0, 0, 0.22)",
    "0px 64px 128px rgba(0, 0, 0, 0.75), 0px 60px 39px rgba(0, 0, 0, 0.22)",
    "0px 69px 138px rgba(0, 0, 0, 0.80), 0px 65px 42px rgba(0, 0, 0, 0.22)",
    "0px 74px 148px rgba(0, 0, 0, 0.85), 0px 70px 45px rgba(0, 0, 0, 0.22)",
    "0px 79px 158px rgba(0, 0, 0, 0.90), 0px 75px 48px rgba(0, 0, 0, 0.22)",
    "0px 84px 168px rgba(0, 0, 0, 0.95), 0px 80px 51px rgba(0, 0, 0, 0.22)",
    "0px 89px 178px rgba(0, 0, 0, 1.00), 0px 85px 54px rgba(0, 0, 0, 0.22)",
    "0px 94px 188px rgba(0, 0, 0, 1.00), 0px 90px 57px rgba(0, 0, 0, 0.22)",
    "0px 99px 198px rgba(0, 0, 0, 1.00), 0px 95px 60px rgba(0, 0, 0, 0.22)",
    "0px 104px 208px rgba(0, 0, 0, 1.00), 0px 100px 63px rgba(0, 0, 0, 0.22)",
    "0px 109px 218px rgba(0, 0, 0, 1.00), 0px 105px 66px rgba(0, 0, 0, 0.22)",
    "0px 114px 228px rgba(0, 0, 0, 1.00), 0px 110px 69px rgba(0, 0, 0, 0.22)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "10px 24px",
          boxShadow: "none",
          transition: "all 0.2s ease-in-out",
          fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(46, 125, 50, 0.3)",
            transform: "translateY(-1px)",
          },
        },
        contained: {
          background: primary,
          "&:hover": {
            background: primaryDark,
            boxShadow: "0px 6px 16px rgba(46, 125, 50, 0.4)",
          },
        },
        outlined: {
          borderWidth: "2px",
          borderColor: primary,
          color: primary,
          "&:hover": {
            borderWidth: "2px",
            background: "rgba(46, 125, 50, 0.04)",
            transform: "translateY(-1px)",
          },
        },
        text: {
          color: primary,
          "&:hover": {
            background: "rgba(46, 125, 50, 0.04)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "&:last-child": {
            paddingBottom: "24px",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          fontSize: "0.8rem",
          fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
          "&.MuiChip-colorPrimary": {
            background: primary,
            color: "#FFFFFF",
          },
          "&.MuiChip-colorSecondary": {
            background: secondary,
            color: "#FFFFFF",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
            transition: "all 0.2s ease-in-out",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: primary,
              borderWidth: "2px",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: primary,
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: surface,
          color: "#1A1A1A",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid rgba(0, 0, 0, 0.08)",
          background: surface,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "4px 8px",
          fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(46, 125, 50, 0.08)",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(46, 125, 50, 0.12)",
            borderLeft: `4px solid ${primary}`,
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "4px 8px",
          fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(46, 125, 50, 0.08)",
            transform: "scale(1.05)",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: primary,
          "&:hover": {
            background: primaryDark,
            transform: "scale(1.05)",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: primary,
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: primary,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: primary,
          "&.Mui-checked": {
            color: primary,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: primary,
          "&.Mui-checked": {
            color: primary,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            backgroundColor: background,
            fontWeight: 600,
            fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: `"Verdana", "Geneva", "Tahoma", "sans-serif"`,
        },
      },
    },
  },
});

export default AGILITY_THEME;
