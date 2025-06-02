// Mock the matchGPlacesToFSAEstab function before requiring the route
jest.mock('../fsa-data-sync/matchGPlacesToFSAEstab', () => ({
    matchGPlacesToFSAEstab: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const { matchGPlacesToFSAEstab } = require('../fsa-data-sync/matchGPlacesToFSAEstab');
const hygieneScoreRoute = require('../routes/hygieneScoreRoute');

describe('Hygiene Score Route - Unit Tests (Mocked)', () => {
    let app;

    beforeAll(() => {
        // Setup Express app for testing
        app = express();
        app.use(express.json());
        app.use('/api/hygieneScoreRoute', hygieneScoreRoute);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/hygieneScoreRoute', () => {
        const samplePlaces = [
            {
                place_id: "ChIJiVvjYX0FdkgR8wbzgP3ygJ0",
                name: "Gaucho Covent Garden",
                address: "8-9 James St, London WC2E 8BT, UK",
                postcode: "WC2E 8BT",
                latitude: 51.5128231,
                longitude: -0.12352710000000001
            },
            {
                place_id: "ChIJ9RQEoMsEdkgR7j7ThuwfQ7A",
                name: "Balthazar",
                address: "4-6 Russell St, London WC2B 5HZ, UK",
                postcode: "WC2B 5HZ",
                latitude: 51.512397899999996,
                longitude: -0.1213613
            }
        ];

        it('should return matched results successfully', async () => {
            const mockMatchedResults = [
                {
                    ...samplePlaces[0],
                    business_name: "Gaucho Covent Garden",
                    rating_value_str: "5",
                    rating_key: "fhrs_5_en-gb",
                    establishment_id: 12345
                },
                {
                    ...samplePlaces[1],
                    business_name: "Balthazar Restaurant",
                    rating_value_str: "4", 
                    rating_key: "fhrs_4_en-gb",
                    establishment_id: 67890
                }
            ];

            matchGPlacesToFSAEstab.mockResolvedValueOnce(mockMatchedResults);

            const response = await request(app)
                .post('/api/hygieneScoreRoute')
                .send({ places: samplePlaces });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty('rating_value_str', '5');
            expect(response.body[1]).toHaveProperty('rating_value_str', '4');
            expect(matchGPlacesToFSAEstab).toHaveBeenCalledWith(samplePlaces);
        });

        it('should handle empty results from matching function', async () => {
            matchGPlacesToFSAEstab.mockResolvedValueOnce(null);

            const response = await request(app)
                .post('/api/hygieneScoreRoute')
                .send({ places: samplePlaces });

            expect(response.status).toBe(200);
            expect(response.body).toBeNull();
            expect(matchGPlacesToFSAEstab).toHaveBeenCalledWith(samplePlaces);
        });

        it('should handle empty places array', async () => {
            matchGPlacesToFSAEstab.mockResolvedValueOnce([]);

            const response = await request(app)
                .post('/api/hygieneScoreRoute')
                .send({ places: [] });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(0);
            expect(matchGPlacesToFSAEstab).toHaveBeenCalledWith([]);
        });

        it('should return 400 for invalid input (non-array)', async () => {
            const response = await request(app)
                .post('/api/hygieneScoreRoute')
                .send({ places: "not an array" });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid input: places should be an array');
            expect(matchGPlacesToFSAEstab).not.toHaveBeenCalled();
        });

        it('should return 400 for missing places field', async () => {
            const response = await request(app)
                .post('/api/hygieneScoreRoute')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid input: places should be an array');
            expect(matchGPlacesToFSAEstab).not.toHaveBeenCalled();
        });

        it('should handle errors from matching function', async () => {
            const mockError = new Error('Database connection failed');
            matchGPlacesToFSAEstab.mockRejectedValueOnce(mockError);

            const response = await request(app)
                .post('/api/hygieneScoreRoute')
                .send({ places: samplePlaces });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to perform search');
            expect(matchGPlacesToFSAEstab).toHaveBeenCalledWith(samplePlaces);
        });

        it('should handle partial matches', async () => {
            const mockPartialResults = [
                {
                    ...samplePlaces[0],
                    business_name: "Gaucho Covent Garden",
                    rating_value_str: "5",
                    establishment_id: 12345
                }
                // Only first place matched, second place not found
            ];

            matchGPlacesToFSAEstab.mockResolvedValueOnce(mockPartialResults);

            const response = await request(app)
                .post('/api/hygieneScoreRoute')
                .send({ places: samplePlaces });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toHaveProperty('name', 'Gaucho Covent Garden');
            expect(response.body[0]).toHaveProperty('rating_value_str', '5');
        });

        it('should preserve original place data in results', async () => {
            const mockResults = [
                {
                    ...samplePlaces[0],
                    business_name: "Gaucho Covent Garden",
                    rating_value_str: "5",
                    establishment_id: 12345
                }
            ];

            matchGPlacesToFSAEstab.mockResolvedValueOnce(mockResults);

            const response = await request(app)
                .post('/api/hygieneScoreRoute')
                .send({ places: [samplePlaces[0]] });

            expect(response.status).toBe(200);
            expect(response.body[0]).toHaveProperty('place_id', samplePlaces[0].place_id);
            expect(response.body[0]).toHaveProperty('name', samplePlaces[0].name);
            expect(response.body[0]).toHaveProperty('address', samplePlaces[0].address);
            expect(response.body[0]).toHaveProperty('postcode', samplePlaces[0].postcode);
            expect(response.body[0]).toHaveProperty('latitude', samplePlaces[0].latitude);
            expect(response.body[0]).toHaveProperty('longitude', samplePlaces[0].longitude);
        });
    });
}); 