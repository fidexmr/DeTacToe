export function mapNetworkToName(network: number): string {
  switch (network) {
    case 5:
      return 'Goerli Testnet';
    case 5777:
      return 'Local ganache network';
    default:
      return 'Unknown network';
  }
}

export function getNetworkUnit(network: number): string {
  switch (network) {
    case 5:
      return 'GöEth';
    case 5777:
      return 'DGCC';
    default:
      return 'Eth';
  }
}
