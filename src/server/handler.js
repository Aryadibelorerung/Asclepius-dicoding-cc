const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const Boom = require('@hapi/boom');
const storeData = require('../services/storeData');

async function postPredictHandler(request, h) {
    const { image } = request.payload;

    // Verifikasi ukuran gambar
    if (image.bytes > 1000000) {
        throw Boom.payloadTooLarge('Payload content length greater than maximum allowed: 1000000');
    }

    try {
        const { model } = request.server.app;
        const { label, suggestion } = await predictClassification(model, image);
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const data = {
            id,
            result: label,
            suggestion,
            createdAt,
        };

        await storeData(id, data);

        return h.response({
            status: 'success',
            message: 'Model is predicted successfully',
            data,
        }).code(201);
    } catch (error) {
        throw Boom.badRequest('Terjadi kesalahan dalam melakukan prediksi');
    }
}

module.exports = postPredictHandler;
