import axios from 'axios';

async function testRemote() {
    console.log("====== TEST RENDER REMOTE SERVER ======");
    try {
        const r1 = await axios.get('https://dsh-scraper-api.onrender.com/api/health');
        console.log("Health Check:", r1.status, r1.data);
    } catch (e) {
        console.log("Health Check Error:", e.message);
    }

    try {
        const r2 = await axios.get('https://dsh-scraper-api.onrender.com/api/lidertek/search?q=cable');
        console.log("Lidertek API:", r2.status, `(Items: ${r2.data.length})`);
    } catch (e) {
        console.log("Lidertek API Error:", e.response ? e.response.status : e.message);
    }

    try {
        const r3 = await axios.get('https://dsh-scraper-api.onrender.com/api/ufo/search?q=cable');
        console.log("UFO API:", r3.status, `(Items: ${r3.data.length})`);
    } catch (e) {
        console.log("UFO API Error:", e.response ? e.response.status : e.message);
    }

    console.log("\n====== TEST UFO DIRECT ======");
    try {
        const searchUrl = `https://sistemaufo.com.uy/?s=cable&post_type=product`;
        const response = await axios.get(searchUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        console.log("UFO Directo Status:", response.status);
    } catch (e) {
        console.log("UFO Directo Error:", e.response ? e.response.status : e.message);
    }
}

testRemote();
