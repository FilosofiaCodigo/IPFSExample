const NETWORK_ID = 4
const CONTRACT_ADDRESS = "0x2FbdF6154882011D963DFe5Ca3A3c3c62Ade1091"
const JSON_CONTRACT_ABI_PATH = "./ContractABI.json"
var contract
var accounts
var web3

// IPFS TUTORIAL part 1: Init IPFS
const ipfs = window.IpfsHttpClient.create({ host: "ipfs.infura.io", port: "5001", protocol: "https" })

function metamaskReloadCallback() {
  window.ethereum.on('accountsChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Se cambió el account, refrescando...";
    window.location.reload()
  })
  window.ethereum.on('networkChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Se el network, refrescando...";
    window.location.reload()
  })
}

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    if(document.readyState=="complete")
    {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        window.location.reload()
        resolve(web3)
      } else {
        reject("must install MetaMask")
        document.getElementById("web3_message").textContent="Error: Porfavor conéctate a Metamask";
      }
    }else
    {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum)
          resolve(web3)
        } else {
          reject("must install MetaMask")
          document.getElementById("web3_message").textContent="Error: Please install Metamask";
        }
      });
    }
  });
};

const getContract = async (web3, address, abi_path) => {
  const response = await fetch(abi_path);
  const data = await response.json();
  
  const netId = await web3.eth.net.getId();
  var result = new web3.eth.Contract(
    data,
    address
    );
  return result
}

async function loadDapp() {
  metamaskReloadCallback()
  document.getElementById("web3_message").textContent="Please connect to Metamask"
  var awaitWeb3 = async function () {
    web3 = await getWeb3()
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID) {
        var awaitContract = async function () {
          contract = await getContract(web3, CONTRACT_ADDRESS, JSON_CONTRACT_ABI_PATH);
          await window.ethereum.request({ method: "eth_requestAccounts" })
          accounts = await web3.eth.getAccounts()
          document.getElementById("web3_message").textContent="You are connected to Metamask"
          onContractInitCallback()
        };
        awaitContract();
      } else {
        document.getElementById("web3_message").textContent="Please connect to Rinkeby";
      }
    });
  };
  awaitWeb3();
}

const onContractInitCallback = async () => {
  var ipfs_path = await contract.methods.image_ipfs_hash().call()
  console.log("https://ipfs.io/ipfs/" + ipfs_path)
  document.getElementById("ipfs_image").src = "https://ipfs.io/ipfs/" + ipfs_path
  console.log(document.getElementById("ipfs_image"))
}

const setImage = async (ipfs_path) => {
  const result = await contract.methods.setImage(ipfs_path)
  .send({ from: accounts[0], gas: 0, value: 0 })
  .on('transactionHash', function(hash){
    document.getElementById("web3_message").textContent="Setting image...";
  })
  .on('receipt', function(receipt){
    document.getElementById("web3_message").textContent="Success.";    })
  .catch((revertReason) => {
    console.log("ERROR! Transaction reverted: " + revertReason.receipt.transactionHash)
  });
}

// IPFS TUTORIAL part 3: Upload to IPFS
document.getElementById('file_upload').onchange = function() {
  var reader = new FileReader();
  reader.onload = function() {
      uploadFileToIPFS(this.result)
  }
  reader.readAsArrayBuffer(this.files[0]);
};

async function uploadFileToIPFS(array_buffer)
{
  array = new Uint8Array(array_buffer)    
  var ipfs_hash = await ipfs.add(array_buffer, (err, result) => {
      
  })
  console.log(ipfs_hash.path)
  setImage(ipfs_hash.path)
}

loadDapp()