const geoService = require('../services/geoService');

async function testGeoService() {
    console.log('Test du service géographique...\n');

    const testCities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'];

    for (const city of testCities) {
        try {
            console.log(`Test pour ${city}:`);
            const cityInfo = await geoService.getCityInfo(city);
            console.log(`✅ ${city}: lat=${cityInfo.latitude}, lon=${cityInfo.longitude}, pop=${cityInfo.population}`);
        } catch (error) {
            console.log(`❌ ${city}: ${error.message}`);
        }
        console.log('');
    }

    console.log('Test terminé!');
}

testGeoService(); 