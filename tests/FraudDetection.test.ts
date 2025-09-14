import { describe, it, expect, beforeEach } from "vitest";
import { stringAsciiCV, uintCV } from "@stacks/transactions";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_LISTING_ID = 101;
const ERR_INVALID_ITEM_HASH = 102;
const ERR_INVALID_SELLER_DID = 103;
const ERR_INVALID_REPUTATION = 104;
const ERR_DUPLICATE_HASH = 105;
const ERR_BLACKLISTED_SELLER = 107;
const ERR_ANOMALY_DETECTED = 108;
const ERR_INVALID_PRICE = 109;
const ERR_INVALID_CATEGORY = 110;
const ERR_INVALID_LOCATION = 115;
const ERR_INVALID_CURRENCY = 116;
const ERR_LISTING_NOT_FOUND = 118;
const ERR_INVALID_RISK_SCORE = 113;
const ERR_AUTHORITY_NOT_SET = 112;

interface ListingDetails {
  itemHash: string;
  sellerDid: string;
  price: number;
  category: string;
  location: string;
  currency: string;
  status: boolean;
}

interface FlaggedListing {
  reason: string;
  timestamp: number;
  riskScore: number;
}

interface Result<T> {
  ok: boolean;
  value: T;
}

class FraudDetectionMock {
  state: {
    fraudThreshold: number;
    minReputation: number;
    maxRiskScore: number;
    authorityContract: string | null;
    anomalyDetectionEnabled: boolean;
    flaggedListings: Map<number, FlaggedListing>;
    sellerBlacklist: Map<string, boolean>;
    listingHistory: Map<string, number>;
    riskScores: Map<number, number>;
    listingDetails: Map<number, ListingDetails>;
  } = {
    fraudThreshold: 50,
    minReputation: 100,
    maxRiskScore: 80,
    authorityContract: null,
    anomalyDetectionEnabled: true,
    flaggedListings: new Map(),
    sellerBlacklist: new Map(),
    listingHistory: new Map(),
    riskScores: new Map(),
    listingDetails: new Map(),
  };
  blockHeight: number = 0;
  caller: string = "ST1TEST";

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      fraudThreshold: 50,
      minReputation: 100,
      maxRiskScore: 80,
      authorityContract: null,
      anomalyDetectionEnabled: true,
      flaggedListings: new Map(),
      sellerBlacklist: new Map(),
      listingHistory: new Map(),
      riskScores: new Map(),
      listingDetails: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1TEST";
  }

  setAuthorityContract(contractPrincipal: string): Result<boolean> {
    if (this.state.authorityContract !== null) return { ok: false, value: false };
    this.state.authorityContract = contractPrincipal;
    return { ok: true, value: true };
  }

  setFraudThreshold(newThreshold: number): Result<boolean> {
    if (!this.state.authorityContract) return { ok: false, value: false };
    this.state.fraudThreshold = newThreshold;
    return { ok: true, value: true };
  }

  setMinReputation(newMin: number): Result<boolean> {
    if (!this.state.authorityContract) return { ok: false, value: false };
    this.state.minReputation = newMin;
    return { ok: true, value: true };
  }

  setMaxRiskScore(newMax: number): Result<boolean> {
    if (!this.state.authorityContract) return { ok: false, value: false };
    this.state.maxRiskScore = newMax;
    return { ok: true, value: true };
  }

  toggleAnomalyDetection(): Result<boolean> {
    if (!this.state.authorityContract) return { ok: false, value: false };
    this.state.anomalyDetectionEnabled = !this.state.anomalyDetectionEnabled;
    return { ok: true, value: this.state.anomalyDetectionEnabled };
  }

  blacklistSeller(seller: string): Result<boolean> {
    if (!this.state.authorityContract) return { ok: false, value: false };
    this.state.sellerBlacklist.set(seller, true);
    return { ok: true, value: true };
  }

  unblacklistSeller(seller: string): Result<boolean> {
    if (!this.state.authorityContract) return { ok: false, value: false };
    this.state.sellerBlacklist.delete(seller);
    return { ok: true, value: true };
  }

  validateListing(
    listingId: number,
    itemHash: string,
    sellerDid: string,
    rep: number,
    price: number,
    category: string,
    location: string,
    currency: string
  ): Result<boolean> {
    if (listingId <= 0) return { ok: false, value: false };
    if (itemHash.length !== 64) return { ok: false, value: false };
    if (sellerDid === this.caller) return { ok: false, value: false };
    if (rep < this.state.minReputation) return { ok: false, value: false };
    if (price <= 0) return { ok: false, value: false };
    if (category.length <= 0 || category.length > 50) return { ok: false, value: false };
    if (location.length <= 0 || location.length > 100) return { ok: false, value: false };
    if (!["STX", "USD", "BTC"].includes(currency)) return { ok: false, value: false };
    if (this.state.listingHistory.has(itemHash)) return { ok: false, value: false };
    if (this.state.sellerBlacklist.get(sellerDid) === true) return { ok: false, value: false };

    let riskScore = 0;
    if (this.state.anomalyDetectionEnabled) {
      riskScore = Math.floor(price / 100) + (100 - rep) + (category === "high-risk" ? 20 : 0);
      this.state.riskScores.set(listingId, riskScore);
      if (riskScore > this.state.maxRiskScore) return { ok: false, value: false };
    }

    this.state.listingDetails.set(listingId, {
      itemHash,
      sellerDid,
      price,
      category,
      location,
      currency,
      status: true,
    });
    this.state.listingHistory.set(itemHash, listingId);
    return { ok: true, value: true };
  }

  flagListing(listingId: number, reason: string, riskScore: number): Result<boolean> {
    if (!this.state.authorityContract) return { ok: false, value: false };
    const details = this.state.listingDetails.get(listingId);
    if (!details) return { ok: false, value: false };
    if (riskScore > this.state.maxRiskScore) return { ok: false, value: false };
    this.state.flaggedListings.set(listingId, { reason, timestamp: this.blockHeight, riskScore });
    details.status = false;
    this.state.listingDetails.set(listingId, details);
    return { ok: true, value: true };
  }

  unflagListing(listingId: number): Result<boolean> {
    if (!this.state.authorityContract) return { ok: false, value: false };
    const details = this.state.listingDetails.get(listingId);
    if (!details) return { ok: false, value: false };
    this.state.flaggedListings.delete(listingId);
    details.status = true;
    this.state.listingDetails.set(listingId, details);
    return { ok: true, value: true };
  }

  updateListingPrice(listingId: number, newPrice: number): Result<boolean> {
    const details = this.state.listingDetails.get(listingId);
    if (!details) return { ok: false, value: false };
    if (details.sellerDid !== this.caller) return { ok: false, value: false };
    if (newPrice <= 0) return { ok: false, value: false };
    details.price = newPrice;
    this.state.listingDetails.set(listingId, details);
    return { ok: true, value: true };
  }

  pauseListing(listingId: number): Result<boolean> {
    const details = this.state.listingDetails.get(listingId);
    if (!details) return { ok: false, value: false };
    if (details.sellerDid !== this.caller) return { ok: false, value: false };
    if (!details.status) return { ok: false, value: false };
    details.status = false;
    this.state.listingDetails.set(listingId, details);
    return { ok: true, value: true };
  }

  resumeListing(listingId: number): Result<boolean> {
    const details = this.state.listingDetails.get(listingId);
    if (!details) return { ok: false, value: false };
    if (details.sellerDid !== this.caller) return { ok: false, value: false };
    if (details.status) return { ok: false, value: false };
    details.status = true;
    this.state.listingDetails.set(listingId, details);
    return { ok: true, value: true };
  }
}

describe("FraudDetection", () => {
  let contract: FraudDetectionMock;

  beforeEach(() => {
    contract = new FraudDetectionMock();
    contract.reset();
  });

  it("sets authority contract successfully", () => {
    const result = contract.setAuthorityContract("ST2TEST");
    expect(result.ok).toBe(true);
    expect(contract.state.authorityContract).toBe("ST2TEST");
  });

  it("validates listing successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.validateListing(
      1,
      "a".repeat(64),
      "STSELLER",
      150,
      1000,
      "general",
      "LocationX",
      "STX"
    );
    expect(result.ok).toBe(true);
    const details = contract.state.listingDetails.get(1);
    expect(details?.price).toBe(1000);
    expect(details?.status).toBe(true);
  });

  it("rejects invalid item hash", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.validateListing(
      1,
      "short",
      "STSELLER",
      150,
      1000,
      "general",
      "LocationX",
      "STX"
    );
    expect(result.ok).toBe(false);
  });

  it("detects anomaly with high risk", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.validateListing(
      1,
      "a".repeat(64),
      "STSELLER",
      50,
      10000,
      "high-risk",
      "LocationX",
      "STX"
    );
    expect(result.ok).toBe(false);
  });

  it("flags listing successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.validateListing(
      1,
      "a".repeat(64),
      "STSELLER",
      150,
      1000,
      "general",
      "LocationX",
      "STX"
    );
    const result = contract.flagListing(1, "Suspicious", 70);
    expect(result.ok).toBe(true);
    const flagged = contract.state.flaggedListings.get(1);
    expect(flagged?.reason).toBe("Suspicious");
  });

  it("blacklists and rejects seller", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.blacklistSeller("STBAD");
    const result = contract.validateListing(
      1,
      "a".repeat(64),
      "STBAD",
      150,
      1000,
      "general",
      "LocationX",
      "STX"
    );
    expect(result.ok).toBe(false);
  });

  it("toggles anomaly detection", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.toggleAnomalyDetection();
    expect(result.ok).toBe(true);
    expect(result.value).toBe(false);
  });

  it("rejects duplicate hash", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.validateListing(
      1,
      "a".repeat(64),
      "STSELLER",
      150,
      1000,
      "general",
      "LocationX",
      "STX"
    );
    const result = contract.validateListing(
      2,
      "a".repeat(64),
      "STSELLER2",
      150,
      1000,
      "general",
      "LocationX",
      "STX"
    );
    expect(result.ok).toBe(false);
  });

  it("unflags listing successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.validateListing(
      1,
      "a".repeat(64),
      "STSELLER",
      150,
      1000,
      "general",
      "LocationX",
      "STX"
    );
    contract.flagListing(1, "Suspicious", 70);
    const result = contract.unflagListing(1);
    expect(result.ok).toBe(true);
    const flagged = contract.state.flaggedListings.get(1);
    expect(flagged).toBeUndefined();
  });

  it("parses Clarity types", () => {
    const hash = stringAsciiCV("a".repeat(64));
    const id = uintCV(1);
    expect(hash.value).toBe("a".repeat(64));
    expect(id.value).toEqual(BigInt(1));
  });
});