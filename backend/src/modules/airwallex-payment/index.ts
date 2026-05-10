import { ModuleProviderExports } from '@medusajs/framework/types'
import AirwallexPaymentProviderService from './service'

const services = [AirwallexPaymentProviderService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
