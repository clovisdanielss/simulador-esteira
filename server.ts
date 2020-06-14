import * as mosca from 'mosca'

let settings = {
    http: {
        port: 1885,
    }
}

let server = new mosca.Server(settings)

server.on('clientConnected', (client) => {
    console.log('client connected', client.id);
});

server.on('published', (pack, cliente) => { 
    console.log('Published: ', pack.payload)
})

server.on('ready', () => {
    console.log(`Servidor escutando em ${settings.http.port}`)
})