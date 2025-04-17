// pages/api/balance/[walletAddress].ts
import { getContract, createThirdwebClient, defineChain } from "thirdweb";
import { totalSupply, balanceOf } from "thirdweb/extensions/erc20";
import type { NextApiRequest, NextApiResponse } from "next";

export const client = createThirdwebClient({
  clientId: process.env.THIRDWEB_CLIENT_ID!,
  secretKey: process.env.THIRDWEB_SECRET_KEY
});

export const geekContract = getContract({
  client,
  chain: defineChain(75512),
  address: "0x3741FcB5792673eF220cCc0b95B5B8C38c5f2723"
});

function formatBigInt(value: bigint, decimals: number): string {
  const str = value.toString().padStart(decimals + 1, "0");
  const integerPart = str.slice(0, -decimals);
  // const decimalPart = str.slice(-decimals);
  return integerPart;
  // return `${integerPart}.${decimalPart}`.replace(/\.?0+$/, ""); // 소수점 이하 0 제거
}

const companyAddress = [
  "0xdA364EE05bC0E37b838ebf1ba8AB2051dc187Dd7",
  "0x687F3413C7f0e089786546BedF809b8F8885B051",
  "0x79dfACcE43E901a5f64C292BF62ba2AE0d25CEF8",
  "0x8ACEA4FEBB072dE21C0bc24E6303D19CCEa5fB62",
  "0x188b3678a4E706D17D060E6FCFbfec359e4bb69a"
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const totalSupplyValue = await totalSupply({
      contract: geekContract,
    })

    const results: Record<string, string> = {};
    let companyVolume = 0;

    for (const address of companyAddress) {
      const result = await balanceOf({ contract: geekContract, address });
      results[address] = result.toString();
      companyVolume += Number(result);
    }

    const totalSupplyVolume = Number(totalSupplyValue);
    const circulatingSupply = totalSupplyVolume - companyVolume;
    const circulatingSupplyPercentage = ((circulatingSupply / totalSupplyVolume) * 100).toFixed(2);
    console.log("Balances:", results);

    console.log("transaction", totalSupplyValue);

    res.status(200).json({
      totalSupply: formatBigInt(totalSupplyValue, 18) ,
      circulatingSupply: formatBigInt(BigInt(circulatingSupply), 18),
      circulationPercentage: circulatingSupplyPercentage + "%",
    });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Failed to fetch balances" });
  }
}
