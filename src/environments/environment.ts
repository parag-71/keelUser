const API_ENDPOINT = window.location.href.includes('localhost') || window.location.href.includes('staging') ?
                    'https://staging.keelsystems.co.nz/api/' : 'https://keelsystems.co.nz/api/'

const BASE_URL = window.location.href.includes('localhost') || window.location.href.includes('staging') ?
                'https://staging.keelsystems.co.nz' : 'https://keelsystems.co.nz'
export const environment = {
    API_ENDPOINT: API_ENDPOINT,
    BASE_URL: BASE_URL,
  }