import { PostSwapSuccessScreen } from './PostSwapSuccessScreen';

export default {
  title: 'Swap / PostSwapSuccessScreen',
};

export const Default = () => (
  <div className="max-w-md mx-auto p-6 bg-background rounded-3xl border shadow-xl">
    <PostSwapSuccessScreen 
      txHash="0x123abc456def7890123abc456def7890123abc456def" 
      onDone={() => alert('Done clicked')}
      onSwapAgain={() => alert('Swap Again clicked')}
    />
  </div>
);

export const WithTradeParams = () => (
  <div className="max-w-md mx-auto p-6 bg-background rounded-3xl border shadow-xl">
    <PostSwapSuccessScreen 
      txHash="0x123abc456def7890123abc456def7890123abc456def"
      tradeParams={{
        fromAmount: '100',
        fromAsset: 'XLM',
        toAmount: '50',
        toAsset: 'USDC',
        exchangeRate: '0.5',
        priceImpact: '0.1%',
        minReceived: '49.5',
        networkFee: '0.01 XLM',
        routePath: [],
        walletAddress: 'GABC123',
      }}
      onDone={() => alert('Done clicked')}
      onSwapAgain={() => alert('Swap Again clicked')}
    />
  </div>
);
