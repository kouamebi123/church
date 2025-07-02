const axios = require('axios');

class GeoService {
    /**
     * Récupère les informations géographiques d'une ville
     * @param {string} cityName - Nom de la ville
     * @param {string} country - Pays (optionnel, par défaut France)
     * @returns {Promise<Object>} - Objet contenant latitude, longitude, population
     */
    async getCityInfo(cityName, country = 'France') {
        try {
            console.log(`Recherche d'informations pour: ${cityName}, ${country}`);
            
            // 1. Récupérer les coordonnées via Nominatim (OpenStreetMap)
            const coordinates = await this.getCoordinates(cityName, country);
            
            if (!coordinates) {
                throw new Error(`Impossible de trouver les coordonnées pour ${cityName}`);
            }

            // 2. Récupérer la population via l'API de géocodage
            const population = await this.getPopulation(cityName, country);

            return {
                latitude: coordinates.lat,
                longitude: coordinates.lon,
                population: population,
                ville: cityName
            };
        } catch (error) {
            console.error('Erreur dans getCityInfo:', error.message);
            throw error;
        }
    }

    /**
     * Récupère les coordonnées d'une ville via Nominatim
     * @param {string} cityName - Nom de la ville
     * @param {string} country - Pays
     * @returns {Promise<Object>} - Objet contenant lat et lon
     */
    async getCoordinates(cityName, country) {
        try {
            const searchQuery = `${cityName}, ${country}`;
            const url = `https://nominatim.openstreetmap.org/search`;
            
            const response = await axios.get(url, {
                params: {
                    q: searchQuery,
                    format: 'json',
                    limit: 1,
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'ChurchApp/1.0'
                }
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                return {
                    lat: parseFloat(result.lat),
                    lon: parseFloat(result.lon)
                };
            }

            return null;
        } catch (error) {
            console.error('Erreur lors de la récupération des coordonnées:', error.message);
            return null;
        }
    }

    /**
     * Récupère la population d'une ville
     * @param {string} cityName - Nom de la ville
     * @param {string} country - Pays
     * @returns {Promise<number>} - Population de la ville
     */
    async getPopulation(cityName, country) {
        try {
            // Utiliser l'API GeoDB Cities pour la population
            const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities`;
            
            const response = await axios.get(url, {
                params: {
                    namePrefix: cityName,
                    countryIds: this.getCountryCode(country),
                    limit: 1,
                    sort: '-population'
                },
                headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || 'demo-key',
                    'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
                }
            });

            if (response.data && response.data.data && response.data.data.length > 0) {
                return response.data.data[0].population || null;
            }

            // Fallback: utiliser des données approximatives pour les grandes villes françaises
            return this.getApproximatePopulation(cityName);
        } catch (error) {
            console.error('Erreur lors de la récupération de la population:', error.message);
            // Fallback: utiliser des données approximatives
            return this.getApproximatePopulation(cityName);
        }
    }

    /**
     * Retourne le code pays ISO
     * @param {string} country - Nom du pays
     * @returns {string} - Code pays ISO
     */
    getCountryCode(country) {
        const countryCodes = {
            'France': 'FR',
            'france': 'FR',
            'FR': 'FR'
        };
        return countryCodes[country] || 'FR';
    }

    /**
     * Données approximatives de population pour les grandes villes françaises
     * @param {string} cityName - Nom de la ville
     * @returns {number|null} - Population approximative
     */
    getApproximatePopulation(cityName) {
        const cityPopulations = {
            'Paris': 2161000,
            'Marseille': 861635,
            'Lyon': 513275,
            'Toulouse': 479553,
            'Nice': 342522,
            'Nantes': 309346,
            'Strasbourg': 280966,
            'Montpellier': 285121,
            'Bordeaux': 254436,
            'Lille': 232787,
            'Rennes': 217728,
            'Reims': 180752,
            'Saint-Étienne': 172565,
            'Toulon': 171953,
            'Le Havre': 170147,
            'Grenoble': 158454,
            'Dijon': 156854,
            'Angers': 154508,
            'Saint-Denis': 153810,
            'Villeurbanne': 150659,
            'Le Mans': 143252,
            'Aix-en-Provence': 143097,
            'Brest': 139456,
            'Nîmes': 146709,
            'Limoges': 132175,
            'Clermont-Ferrand': 143886,
            'Tours': 136463,
            'Villejuif': 131824,
            'Amiens': 133625,
            'Metz': 118489,
            'Besançon': 117912,
            'Perpignan': 119656,
            'Orléans': 114782,
            'Mulhouse': 108942,
            'Caen': 105354,
            'Boulogne-Billancourt': 119808,
            'Rouen': 110169,
            'Nancy': 104260,
            'Argenteuil': 107221,
            'Montreuil': 104139,
            'Saint-Paul': 103916,
            'Roubaix': 98712,
            'Tourcoing': 97442,
            'Nanterre': 94525,
            'Avignon': 91343,
            'Créteil': 90195,
            'Poitiers': 87698,
            'Versailles': 85771,
            'Pau': 77200,
            'Colombes': 85177,
            'Vitry-sur-Seine': 92909,
            'Aulnay-sous-Bois': 82514,
            'Asnières-sur-Seine': 86742,
            'Courbevoie': 81603,
            'Cherbourg-en-Cotentin': 80076,
            'Rueil-Malmaison': 78145,
            'Bourges': 64668,
            'Le Cannet': 41531,
            'Dunkerque': 86865,
            'Saint-Maur-des-Fossés': 75214,
            'Valence': 63848,
            'Quimper': 63532,
            'Antibes': 75820,
            'Troyes': 61996,
            'Auxerre': 34734,
            'Bourgoin-Jallieu': 28447,
            'Cannes': 73421,
            'Calais': 72929,
            'Saint-Brieuc': 44472,
            'Saint-Herblain': 46352,
            'Saint-Priest': 46845,
            'La Rochelle': 75736,
            'Rezé': 42068,
            'Saint-André': 55653,
            'Montauban': 60489,
            'Chambery': 58753,
            'Aix-les-Bains': 30812,
            'Boulogne-sur-Mer': 42092,
            'Châteauroux': 43442,
            'Chalon-sur-Saône': 45166,
            'Albi': 49532,
            'Mâcon': 34350,
            'Colmar': 67714,
            'Dole': 23575,
            'Épinal': 32006,
            'Montbéliard': 25405,
            'Valenciennes': 43336,
            'Thionville': 40578,
            'Tarbes': 43363,
            'Haguenau': 35112,
            'Charleville-Mézières': 46348,
            'Évreux': 47533,
            'Saint-Étienne-du-Rouvray': 28408,
            'Drancy': 71043,
            'Noisy-le-Grand': 66888,
            'Ivry-sur-Seine': 63486,
            'Évry-Courcouronnes': 67591,
            'Villeneuve-d\'Ascq': 62408,
            'Sarcelles': 58546,
            'Le Blanc-Mesnil': 55519,
            'Alfortville': 44818,
            'Saint-Ouen': 53107,
            'Neuilly-sur-Seine': 59940,
            'Clichy': 62854,
            'Pantin': 57001,
            'Maisons-Alfort': 54843,
            'Malakoff': 30420,
            'Bagneux': 40336,
            'Fontenay-sous-Bois': 52424,
            'Issy-les-Moulineaux': 67198,
            'Bondy': 54866,
            'Bobigny': 54787,
            'Les Lilas': 23001,
            'Vincennes': 49568,
            'Saint-Mandé': 22563,
            'Montrouge': 50260,
            'Bagnolet': 35773,
            'Rosny-sous-Bois': 46527,
            'Noisy-le-Sec': 45674,
            'Le Pré-Saint-Gervais': 17050,
            'Romainville': 47028,
            'L\'Île-Saint-Denis': 8047,
            'Le Raincy': 14481,
            'Neuilly-Plaisance': 20778,
            'Neuilly-sur-Marne': 35608,
            'Gagny': 39902,
            'Gournay-sur-Marne': 6787,
            'Villemomble': 29968,
            'Le Perreux-sur-Marne': 33902,
            'Bry-sur-Marne': 16888,
            'Champigny-sur-Marne': 76818,
            'Saint-Maurice': 14568,
            'Joinville-le-Pont': 19052,
            'Nogent-sur-Marne': 31849,
            'Saint-Mandé': 22563,
            'Vincennes': 49568,
            'Fontenay-sous-Bois': 52424,
            'Montreuil': 104139,
            'Bagnolet': 35773,
            'Les Lilas': 23001,
            'Romainville': 47028,
            'Noisy-le-Sec': 45674,
            'Bondy': 54866,
            'Bobigny': 54787,
            'Drancy': 71043,
            'Aulnay-sous-Bois': 82514,
            'Le Blanc-Mesnil': 55519,
            'Sevran': 51249,
            'Villepinte': 37725,
            'Tremblay-en-France': 35885,
            'Gonesse': 25677,
            'Garges-lès-Gonesse': 42528,
            'Sarcelles': 58546,
            'Goussainville': 30991,
            'Villiers-le-Bel': 27145,
            'Argenteuil': 107221,
            'Bezons': 28712,
            'Colombes': 85177,
            'Asnières-sur-Seine': 86742,
            'Courbevoie': 81603,
            'Puteaux': 44891,
            'Neuilly-sur-Seine': 59940,
            'Levallois-Perret': 64110,
            'Clichy': 62854,
            'Saint-Ouen': 53107,
            'Saint-Denis': 153810,
            'Aubervilliers': 88625,
            'La Courneuve': 43354,
            'Saintains': 0,
            'Épinay-sur-Seine': 54781,
            'Villetaneuse': 12312,
            'Pierrefitte-sur-Seine': 29561,
            'Stains': 38105,
            'Saint-Gratien': 20767,
            'Enghien-les-Bains': 11325,
            'Soisy-sous-Montmorency': 17818,
            'Ermont': 28421,
            'Eaubonne': 24476,
            'Saint-Leu-la-Forêt': 15450,
            'Taverny': 26436,
            'Bessancourt': 8084,
            'Frépillon': 3334,
            'Butry-sur-Oise': 2308,
            'Méry-sur-Oise': 9875,
            'Mériel': 5200,
            'Valmondois': 1234,
            'L\'Isle-Adam': 11815,
            'Parmain': 5600,
            'Nesles-la-Vallée': 1774,
            'Nointel': 823,
            'Champagne-sur-Oise': 4756,
            'Persan': 12500,
            'Beaumont-sur-Oise': 9567,
            'Bernes-sur-Oise': 2500,
            'Bruyères-sur-Oise': 3500,
            'L\'Isle-Adam': 11815,
            'Parmain': 5600,
            'Nesles-la-Vallée': 1774,
            'Nointel': 823,
            'Champagne-sur-Oise': 4756,
            'Persan': 12500,
            'Beaumont-sur-Oise': 9567,
            'Bernes-sur-Oise': 2500,
            'Bruyères-sur-Oise': 3500
        };

        // Recherche insensible à la casse
        const normalizedCityName = cityName.toLowerCase().trim();
        
        for (const [city, population] of Object.entries(cityPopulations)) {
            if (city.toLowerCase().includes(normalizedCityName) || 
                normalizedCityName.includes(city.toLowerCase())) {
                return population;
            }
        }

        return null;
    }

    /**
     * Récupère les informations géographiques à partir d'une adresse complète
     * @param {string} adresse - Adresse complète
     * @param {string} country - Pays (optionnel, par défaut France)
     * @returns {Promise<Object>} - Objet contenant latitude, longitude, ville, population
     */
    async getAddressInfo(adresse, country = 'France') {
        try {
            const url = `https://nominatim.openstreetmap.org/search`;
            const response = await axios.get(url, {
                params: {
                    q: adresse,
                    format: 'json',
                    addressdetails: 1,
                    limit: 1
                },
                headers: {
                    'User-Agent': 'ChurchApp/1.0'
                }
            });
            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                const ville = result.address.city || result.address.town || result.address.village || result.address.municipality || result.address.county || '';
                const coordinates = {
                    lat: parseFloat(result.lat),
                    lon: parseFloat(result.lon)
                };
                // Récupérer la population à partir de la ville
                const population = ville ? await this.getPopulation(ville, country) : null;
                return {
                    latitude: coordinates.lat,
                    longitude: coordinates.lon,
                    ville,
                    population
                };
            }
            return null;
        } catch (error) {
            console.error('Erreur dans getAddressInfo:', error.message);
            throw error;
        }
    }
}

module.exports = new GeoService(); 