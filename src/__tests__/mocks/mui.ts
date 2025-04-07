import { vi } from "vitest"
import React from "react"

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material")
  return {
    ...actual,
    Dialog: function Dialog({ children, open }: any) {
      return open
        ? React.createElement("div", { "data-testid": "mui-dialog" }, children)
        : null
    },
    DialogTitle: function DialogTitle({ children }: any) {
      return React.createElement(
        "div",
        { "data-testid": "mui-dialog-title" },
        children
      )
    },
    DialogContent: function DialogContent({ children }: any) {
      return React.createElement(
        "div",
        { "data-testid": "mui-dialog-content" },
        children
      )
    },
    DialogActions: function DialogActions({ children }: any) {
      return React.createElement(
        "div",
        { "data-testid": "mui-dialog-actions" },
        children
      )
    },
    TextField: function TextField({
      label,
      name,
      value,
      onChange,
      error,
      helperText,
      placeholder,
      ...props
    }: any) {
      return React.createElement(
        "div",
        { "data-testid": `mui-textfield-${name || ""}` },
        [
          label &&
            React.createElement(
              "label",
              { htmlFor: name, key: "label" },
              label
            ),
          React.createElement("input", {
            id: name,
            name,
            value,
            onChange,
            placeholder,
            "data-testid": `input-${name || ""}`,
            ...props,
            key: "input",
          }),
          error && React.createElement("span", { key: "error" }, helperText),
        ]
      )
    },
    Button: function Button({ children, onClick, type, ...props }: any) {
      return React.createElement(
        "button",
        { onClick, type, ...props },
        children
      )
    },
    IconButton: function IconButton({ children, onClick, ...props }: any) {
      return React.createElement("button", { onClick, ...props }, children)
    },
    Box: function Box({ children, ...props }: any) {
      return React.createElement("div", props, children)
    },
    Stack: function Stack({ children, ...props }: any) {
      return React.createElement("div", props, children)
    },
    CircularProgress: function CircularProgress() {
      return React.createElement(
        "div",
        { "data-testid": "mui-loading" },
        "Loading..."
      )
    },
    Alert: function Alert({ children, severity }: any) {
      return React.createElement(
        "div",
        { "data-testid": `mui-alert-${severity}` },
        children
      )
    },
    Typography: function Typography({ children, variant }: any) {
      return React.createElement(
        "div",
        { "data-testid": `mui-typography-${variant}` },
        children
      )
    },
    Paper: function Paper({ children }: any) {
      return React.createElement(
        "div",
        { "data-testid": "mui-paper" },
        children
      )
    },
    Tooltip: function Tooltip({ children, title }: any) {
      return React.createElement("div", { title }, children)
    },
    InputAdornment: function InputAdornment({ children, position }: any) {
      return React.createElement(
        "div",
        { "data-testid": `mui-input-adornment-${position}` },
        children
      )
    },
  }
})

vi.mock("@mui/icons-material", async () => {
  return {
    Close: function Close() {
      return React.createElement(
        "span",
        { "data-testid": "mui-icon-close" },
        "×"
      )
    },
    Search: function Search() {
      return React.createElement(
        "span",
        { "data-testid": "mui-icon-search" },
        "🔍"
      )
    },
    YouTube: function YouTube() {
      return React.createElement(
        "span",
        { "data-testid": "mui-icon-youtube" },
        "▶️"
      )
    },
    ThumbUp: function ThumbUp() {
      return React.createElement(
        "span",
        { "data-testid": "mui-icon-thumbup" },
        "👍"
      )
    },
    Visibility: function Visibility() {
      return React.createElement(
        "span",
        { "data-testid": "mui-icon-visibility" },
        "👁️"
      )
    },
    Link: function Link() {
      return React.createElement(
        "span",
        { "data-testid": "mui-icon-link" },
        "🔗"
      )
    },
    Image: function Image() {
      return React.createElement(
        "span",
        { "data-testid": "mui-icon-image" },
        "🖼️"
      )
    },
    Save: function Save() {
      return React.createElement(
        "span",
        { "data-testid": "mui-icon-save" },
        "💾"
      )
    },
  }
})
