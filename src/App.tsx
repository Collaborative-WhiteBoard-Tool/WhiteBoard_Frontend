import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './App.css'
import Whiteboard from './pages/Whiteboard';
import "./styles/index.css";

function App() {
  return (_jsxs("div", { className: "p-4", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "\uD83D\uDCDD Collaborative Whiteboard" }), _jsx(Whiteboard, {})] }));
}
export default App;