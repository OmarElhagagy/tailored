import { useState, useEffect } from 'react';
import useResponsive from '../src/hooks/useResponsive';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface PaymentMethodSelectorProps {
  onSelect: (methodId: string) => void;
  selectedMethod?: string;
  orderId: string;
  orderTotal: number;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelect,
  selectedMethod,
  orderId,
  orderTotal
}) => {
  const { isMobile } = useResponsive();
  const [expanded, setExpanded] = useState<string | null>(selectedMethod || null);

  // Available payment methods in Egypt
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'fawry',
      name: 'Fawry',
      icon: '/icons/fawry-logo.svg',
      description: 'Pay using Fawry reference number at any Fawry outlet or via myFawry app'
    },
    {
      id: 'vodafone_cash',
      name: 'Vodafone Cash',
      icon: '/icons/vodafone-cash-logo.svg',
      description: 'Transfer the amount to our Vodafone Cash wallet'
    },
    {
      id: 'instapay',
      name: 'InstaPay',
      icon: '/icons/instapay-logo.svg',
      description: 'Pay directly from your bank account using InstaPay'
    },
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      icon: '/icons/cod-logo.svg',
      description: 'Pay when you receive your order (delivery fees may apply)'
    }
  ];

  // Select payment method
  const handleSelect = (methodId: string) => {
    setExpanded(methodId);
    onSelect(methodId);
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
      
      <div className={`space-y-3 ${isMobile ? 'flex flex-col' : ''}`}>
        {paymentMethods.map((method) => (
          <div 
            key={method.id}
            className={`
              border rounded-lg overflow-hidden transition-all duration-200
              ${expanded === method.id ? 'border-blue-500 shadow-md' : 'border-gray-200'}
              ${isMobile ? 'w-full' : 'w-full'}
            `}
          >
            <div 
              className={`
                flex items-center p-4 cursor-pointer
                ${expanded === method.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
              `}
              onClick={() => handleSelect(method.id)}
            >
              <div className="flex-shrink-0 w-12 h-12 mr-4 flex items-center justify-center">
                <img 
                  src={method.icon} 
                  alt={method.name} 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    (e.target as HTMLImageElement).src = '/icons/payment-generic.svg';
                  }}
                />
              </div>
              
              <div className="flex-grow">
                <div className="font-medium">{method.name}</div>
                <div className="text-sm text-gray-500">{method.description}</div>
              </div>
              
              <div className="flex-shrink-0 ml-4">
                <div className={`
                  w-6 h-6 border-2 rounded-full flex items-center justify-center
                  ${expanded === method.id ? 'border-blue-500' : 'border-gray-300'}
                `}>
                  {expanded === method.id && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
            
            {expanded === method.id && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <PaymentMethodDetails 
                  methodId={method.id}
                  orderId={orderId}
                  orderTotal={orderTotal}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Payment method specific details and instructions
const PaymentMethodDetails: React.FC<{
  methodId: string;
  orderId: string;
  orderTotal: number;
}> = ({ methodId, orderId, orderTotal }) => {
  switch (methodId) {
    case 'fawry':
      return (
        <div>
          <p className="font-medium mb-2">How to pay with Fawry:</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>After placing your order, you'll receive a Fawry reference number</li>
            <li>Visit any Fawry outlet or use myFawry app</li>
            <li>Provide the reference number and pay the amount</li>
            <li>Your payment will be confirmed automatically</li>
          </ol>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
            <span className="font-medium">Note:</span> You'll need to complete the payment within 3 days or your order will be canceled automatically.
          </div>
        </div>
      );
      
    case 'vodafone_cash':
      return (
        <div>
          <p className="font-medium mb-2">How to pay with Vodafone Cash:</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>After placing your order, transfer {orderTotal} EGP to our Vodafone Cash wallet</li>
            <li>Use the order number as reference in your transfer</li>
            <li>We'll verify the payment and process your order</li>
          </ol>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
            <span className="font-medium">Important:</span> Please include order number {orderId.slice(-6)} in your transfer note to help us identify your payment.
          </div>
        </div>
      );
      
    case 'instapay':
      return (
        <div>
          <p className="font-medium mb-2">How to pay with InstaPay:</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>After placing your order, you'll receive payment instructions</li>
            <li>Open your banking app and select InstaPay</li>
            <li>Scan the QR code or use the payment link we provide</li>
            <li>Confirm the transaction in your banking app</li>
          </ol>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
            <span className="font-medium">Note:</span> Your bank may charge additional fees for InstaPay transfers.
          </div>
        </div>
      );
      
    case 'cash_on_delivery':
      return (
        <div>
          <p className="font-medium mb-2">How Cash on Delivery works:</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>We'll prepare and ship your order</li>
            <li>Pay the full amount when you receive your order</li>
            <li>Cash only - our delivery personnel don't accept cards</li>
          </ol>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
            <span className="font-medium">Note:</span> Cash on Delivery is subject to location availability and may include additional fees.
          </div>
        </div>
      );
      
    default:
      return <p>Please select a payment method</p>;
  }
};

export default PaymentMethodSelector; 