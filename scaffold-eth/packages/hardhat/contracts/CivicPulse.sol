// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

/**
 * @title CivicPulse Truth Layer
 * @dev A smart contract to permanently anchor high-priority municipal reports to the blockchain.
 * In a Web 2.5 architecture, the heavy lifting (photos, comments) stays in Supabase,
 * while this contract ensures immutable proof that a specific report existed with a given score.
 */
contract CivicPulse {
    // Structure of a purely on-chain anchored report
    struct AnchoredReport {
        string internalId;     // Reference to the Supabase Report ID
        address reporter;      // Wallet of the person who reported it
        string metadataHash;   // Hash/IPFS link of the original data payload
        uint256 timestamp;     // When it was anchored
        bool isResolved;       // Current status tracking
        string resolutionHash; // Proof of Work (Hash of the photo showing the pothole is filled)
    }

    // Mapping of Supabase ID to the On-Chain Anchored Report
    mapping(string => AnchoredReport) public reports;

    // Ordered list to easily fetch the latest anchored reports
    string[] public reportIds;

    // Events to populate subgraphs / frontend listeners
    event ReportAnchored(string id, address indexed reporter, string metadataHash);
    event StatusUpdated(string id, bool isResolved, string resolutionHash);

    /**
     * @dev Anchors a report from the CivicPulse Web2 DB to the Ethereum blockchain.
     * @param _id The UUID or string ID from Supabase
     * @param _hash A cryptographic hash of the JSON metadata of the report 
     * (e.g. hash of "{category: 'POTHOLE', lat: x, lng: y}")
     */
    function anchorReport(string memory _id, string memory _hash) public {
        require(reports[_id].timestamp == 0, "Report ID already anchored");

        reports[_id] = AnchoredReport({
            internalId: _id,
            reporter: msg.sender,
            metadataHash: _hash,
            timestamp: block.timestamp,
            isResolved: false,
            resolutionHash: ""
        });

        reportIds.push(_id);

        emit ReportAnchored(_id, msg.sender, _hash);
    }

    /**
     * @dev Updates the status of an already anchored report and requires a Proof of Resolution
     * @param _id The Supabase UUID
     * @param _resolutionHash The cryptographic hash of the photo showing the repaired infrastructure
     */
    function markResolved(string memory _id, string memory _resolutionHash) public {
        require(reports[_id].timestamp != 0, "Report does not exist on-chain");
        require(!reports[_id].isResolved, "Report is already resolved");
        // For a production app, you might restrict this to the original reporter or specific admin roles
        
        reports[_id].isResolved = true;
        reports[_id].resolutionHash = _resolutionHash;

        emit StatusUpdated(_id, true, _resolutionHash);
    }

    /**
     * @dev Getter to retrieve all historical reports anchored
     */
    function getAllReportsLength() public view returns (uint256) {
        return reportIds.length;
    }
}
