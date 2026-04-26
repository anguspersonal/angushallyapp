# WSL2 React Blank Screen Troubleshooting (2025-07-07)

## Quick Summary

Spent significant time troubleshooting a blank screen when loading a React app in the browser. Ultimately, the issue was not with the code, but with WSL2 networking: the React dev server was running inside WSL2, but `localhost:3000` on Windows did not forward to WSL2's server. The solution was to use the "On Your Network" IP provided by the dev server (`http://172.x.x.x:3000`).  
**Lesson:** Always check for WSL2 networking issues when developing on Windows with Ubuntu/WSL2, especially if the app works in WSL2 but not in the Windows browser.

---

## Detailed Troubleshooting Steps

1. **Checked browser at `localhost:3000`—blank page, no errors.**
2. **Inspected browser console—no errors or warnings.**
3. **Checked DevTools → Sources tab—no JS or source files loaded.**
4. **Checked DevTools → Network tab—no network requests made.**
5. **Checked DevTools → Application tab—no manifest, no service worker.**
6. **Tried hard refresh, cleared cache, and incognito mode—no change.**
7. **Verified React dev server output—showed "Compiled successfully" and correct URLs.**
8. **Ran `lsof -i :3000` in WSL2—confirmed server was listening.**
9. **Ran `curl -i http://localhost:3000` in WSL2—got correct HTML output.**
10. **Checked Windows Command Prompt with `curl`—no response.**
11. **Tried accessing the "On Your Network" IP (`http://172.x.x.x:3000`)—app loaded perfectly!**
12. **Considered and ruled out:**
    - Service worker issues
    - Port conflicts (used `scripts/check-port.js`)
    - Next.js/TypeScript/Jest misconfigurations
    - CSS hiding content
    - Browser extensions
    - Proxy or firewall issues
13. **Conclusion:**  
    - The issue was WSL2's networking: Windows `localhost` did not forward to WSL2's `localhost`.
    - Solution: Use the "On Your Network" IP in the browser.

---

## Reflections

- This was a frustrating but rewarding debugging session.
- Key lesson: When using WSL2, always try the "On Your Network" IP if `localhost` doesn't work.
- Documenting each step helps build a personal troubleshooting checklist for the future. 