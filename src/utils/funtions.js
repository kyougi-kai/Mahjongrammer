export function sendRedirect(ws) {
    ws.send(
        JSON.stringify({
            type: 'redirect',
            payload: {
                url: '/',
            },
        })
    );
}
