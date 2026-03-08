import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the CivicPulse contract using the deployer account
 */
const deployCivicPulse: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("CivicPulse", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: true (useful for local testing)
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const civicPulseContract = await hre.ethers.getContract<Contract>("CivicPulse", deployer);
  console.log("👋 CivicPulse Core Contract deployed at:", await civicPulseContract.getAddress());
};

export default deployCivicPulse;

// Tags are useful if you have multiple deploy files and only want to run one of them.
deployCivicPulse.tags = ["CivicPulse"];
