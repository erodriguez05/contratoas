const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data')
var ncp = require('node-clipboardy');

var form = new FormData()

const providerData = {
    "sign_url": "URL DEL CONTRATO",
    "document_id": "MISMO VALOR QUE EL DE CONTRACT WEESIGN ID",
    "workflow_id": "workflow_uuid VALOR QUE SE OBTIENEN EN EL ENDPOINT 3"
}
let res = ''

const quest = async ({
    name,
    email,
    fileName
}) => {
    const url1 = 'https://api.rem.tools/signt/documents/create-from-file'
    form.append('file', fs.createReadStream(`/Users/Iltze Mon/Downloads/${fileName}.pdf`))
    form.append("document_name", fileName)
    form.append('send_email', 'true')
    form.append('autosigning', 'true')
    form.append('callback_url', 'https://aquariusprod.herokuapp.com/api/v1/digital_signature/completed-document/')
    const formHeader = form.getHeaders()

    const data2 = {
        "signers": [{
            "name": name,
            "email": email,
            "password": "123456",
            "meta_signs": [{
                "page": 6,
                "is_default": false,
                "top": 193.23,
                "left": 131.7,
                "width": 51.01,
                "height": 12.68
            },
            {
                "page": 5,
                "is_default": false,
                "top": 198.9,
                "left": 126.03,
                "width": 55.32,
                "height": 17.54
            }
            ]
        }]
    }

    const config1 = {
        headers: {
            "rem-apikey": " PO3mNGpJw9u9Bgs7bIqzG6cv9O4tMfs16Ypg5ODxUouyCgML5JYZBGuxi0j7YcJY",
            "content-type": formHeader['content-type']
        }
    }
    const config2 = {
        headers: {
            "rem-apikey": "PO3mNGpJw9u9Bgs7bIqzG6cv9O4tMfs16Ypg5ODxUouyCgML5JYZBGuxi0j7YcJY"
        }
    }
    const rest = await axios.post(url1, form, config1).then(responde => {
        res = responde.data.result.id
        providerData.document_id = res
        console.log('ID : ', res)
        const url2 = `https://api.rem.tools/signt/documents/${res}/add-signfields`
        axios.post(url2, data2, config2).then(response => {
            res = response.data.result[0].token
            const data3 = {
                "steps": [
                    "document_sign"
                ],
                "setup": {
                    "document_sign": {
                        "token": res,
                        "store_sign": false
                    }
                }
            }
            const url3 = 'https://api.rem.tools/workflows'
            axios.post(url3, data3, config2).then(response => {
                res = response.data.result.steps[0].workflow_uuid
                providerData.workflow_id = res
                const url4 = `https://api.rem.tools/workflows/${res}/create-token`
                axios.get(url4, config2).then(response => {
                    res = response.data.result.public_url
                    providerData.sign_url = res
                    console.log('URL : ', res)
                    console.log(JSON.stringify(providerData))
                    ncp.writeSync(JSON.stringify(providerData))
                })
            })
        })
    })
}
quest({
    name: "Nombre del cliente",
    email: 'Correo del cliente', 
    fileName: "Nombre del archivo del contrato"
})