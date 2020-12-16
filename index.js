const i2c = require('i2c-bus');
const gpio = require('onoff').Gpio;

const X728_GPIO_POWER = 6;
const X728_AC_STATUS = new gpio(X728_GPIO_POWER, 'in');

const X728_ADDR = 0x36;
const X728_VOLTAGE_REG = 2;
const X728_CAPACITY_REG = 4;

async function ac_connected() {
    var AC_STATUS = await X728_AC_STATUS.read();
    if (AC_STATUS == 1) return 0;
    return 1;
}

function parseWord(rawData) {
    return (rawData >> 8) + ((rawData & 0xff) << 8);
}

async function readVoltage(bus) {
    var voltage = parseWord(await bus.readWord(X728_ADDR, X728_VOLTAGE_REG));
    var v = voltage * 1.25 / 100 / 16;
    v = (5200 + v) / 1000
    v = parseFloat(v.toFixed(4));
    return v;
}

async function readCapacity(bus) {
    var capacity = parseWord(await bus.readWord(X728_ADDR, X728_CAPACITY_REG));
    return (capacity / 256) / 100;
}

// Prometheus
const prometheus = require('prom-client');

var capacity = new prometheus.Gauge({
    name: 'ups_dc_capacity',
    help: 'Battery Level'
});

var voltage = new prometheus.Gauge({
    name: 'ups_dc_voltage',
    help: 'Battery Voltage'
});

var ac_status = new prometheus.Gauge({
    name: 'ups_ac_status',
    help: 'AC Power Status'
});

async function collectMetrics() {
    bus = await i2c.openPromisified(1);
    voltage.set(await readVoltage(bus));
    capacity.set(await readCapacity(bus))
    ac_status.set(await ac_connected())
}

// Express 
const express = require('express')
const app = express()
const PORT = 9728

app.get('/metrics', async function(req, res) {
    try {
        await collectMetrics();
		res.set('Content-Type', prometheus.Registry.globalRegistry.contentType);
		res.end(await prometheus.Registry.globalRegistry.metrics());
	} catch (ex) {
		res.status(500).end(ex);
	}
});

app.listen(PORT, async function() {

    console.log('Setting inital metric values')
    await collectMetrics();

    var metrics = prometheus.Registry.globalRegistry.metrics();
    console.log(metrics);
    console.log(`Prometheus metrics for X728 available at http://localhost:${PORT}/metrics`)
})