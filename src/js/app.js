App = {

  web3Provider: null,
  ipfsHash: '',
  contracts: {},
  account: '0x0',
  loading: false,
  hasVoted: false,
  buffer: null,
  account: null,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
      const a = IPFS.create()
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("e_voting.json", function (election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.e_voting = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.e_voting.setProvider(App.web3Provider);

      return App.render()
    });
  },

  render: function () {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.e_voting.deployed().then(function (instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function (candidatesCount) {
      console.log("candidates count", candidatesCount.toNumber())
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function (candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          //Setting up the IPFS hash
          var LS_2 = localStorage.getItem("LS-1");
          App.ipfsHash = LS_2;

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function (hasVoted) {
      // Do not allow a user to vote
      if (hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function (error) {
      console.warn(error);
    });
  },

  castVote: async function () {
    var candidateId = $('#candidatesSelect').val();

    console.log(App.ipfsHash);


    App.contracts.e_voting.deployed().then(function (instance) {
      return instance.vote(candidateId, App.ipfsHash, {
        from: App.account,
        gas: 500000 // Gas limit
      });
    }).then(function (result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function (err) {
      console.error(err);
    });
    $("#IPHASH").html(App.ipfsHash);
    // console.log(web3.eth.getBlock(4))

  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});