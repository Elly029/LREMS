
async function debugApi() {
    try {
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password123' })
        });

        if (!loginResponse.ok) {
            console.log('Login failed, trying to fetch without token (might fail if protected)');
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;

        const params = new URLSearchParams({
            page: '1',
            limit: '100',
            sortBy: 'bookCode',
            sortOrder: 'asc'
        });

        const response = await fetch(`http://localhost:3000/api/books?${params}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            const text = await response.text();
            console.error('Body:', text);
            return;
        }

        const data = await response.json();
        const books = data.data;
        console.log(`Fetched ${books.length} books.`);

        const targetBook = books.find((b: any) => b.book_code && b.book_code.includes('25G3-S001'));

        if (targetBook) {
            console.log('Found target book:', JSON.stringify(targetBook, null, 2));
            console.log(`'learning_area' value: '${targetBook.learning_area}'`);
            console.log(`'learning_area' char codes: ${targetBook.learning_area.split('').map((c: string) => c.charCodeAt(0)).join(', ')}`);
        } else {
            console.log('Target book 25G3-S001 NOT found in API response.');
            // List all book codes to see what's there
            console.log('Available book codes:', books.map((b: any) => b.book_code));
        }

    } catch (error) {
        console.error('Error fetching API:', error);
    }
}

debugApi();
