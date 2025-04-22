import { ApplicationInsights } from '@applicationinsights/web';

/**
 * Azure Application Insights utility for tracking user behavior
 */
class AppInsightsAnalytics {
  private appInsights: ApplicationInsights | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize Azure Application Insights
   * @param connectionString - Azure App Insights connection string
   * @param instrumentationKey - Azure App Insights instrumentation key
   */
  public init(connectionString?: string, instrumentationKey?: string): void {
    // Exit if running on server or already initialized
    if (typeof window === 'undefined' || this.isInitialized) return;
    
    // Exit if no configuration is provided
    if (!connectionString && !instrumentationKey) {
      console.warn('Azure Application Insights configuration missing');
      return;
    }

    try {
      this.appInsights = new ApplicationInsights({
        config: {
          connectionString: connectionString,
          instrumentationKey: instrumentationKey,
          /* Other configuration options */
          enableAutoRouteTracking: true, // Automatically track route changes
          enableCorsCorrelation: true,
          enableRequestHeaderTracking: true,
          enableResponseHeaderTracking: true,
          disableFetchTracking: false, // Track AJAX requests
          disableExceptionTracking: false,
          disableAjaxTracking: false,
        }
      });

      // Start tracking
      this.appInsights.loadAppInsights();
      this.appInsights.trackPageView(); // Track initial page view
      
      this.isInitialized = true;
      console.log('Azure Application Insights initialized');
    } catch (error) {
      console.error('Failed to initialize Azure Application Insights:', error);
    }
  }

  /**
   * Track page views
   * @param name - Page name
   * @param url - Page URL
   */
  public trackPageView(name?: string, url?: string): void {
    if (!this.isInitialized || !this.appInsights) return;
    
    this.appInsights.trackPageView({
      name: name || document.title,
      uri: url || window.location.href
    });
  }

  /**
   * Track custom events
   * @param name - Event name
   * @param properties - Custom event properties
   */
  public trackEvent(name: string, properties?: { [key: string]: any }): void {
    if (!this.isInitialized || !this.appInsights) return;
    
    this.appInsights.trackEvent({ name }, properties);
  }

  /**
   * Track exceptions
   * @param error - Error object
   * @param properties - Additional properties
   */
  public trackException(error: Error, properties?: { [key: string]: any }): void {
    if (!this.isInitialized || !this.appInsights) return;
    
    this.appInsights.trackException({ 
      exception: error,
      properties
    });
  }

  /**
   * Track product view (e-commerce event)
   */
  public trackProductView(product: {
    id: string;
    name: string;
    category?: string;
    price?: number;
    seller?: string;
  }): void {
    if (!this.isInitialized || !this.appInsights) return;
    
    this.trackEvent('ProductView', {
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
      seller: product.seller
    });
  }

  /**
   * Track add to cart event
   */
  public trackAddToCart(product: {
    id: string;
    name: string;
    category?: string;
    price?: number;
    quantity: number;
    seller?: string;
  }): void {
    if (!this.isInitialized || !this.appInsights) return;
    
    this.trackEvent('AddToCart', {
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      seller: product.seller
    });
  }

  /**
   * Track purchase event
   */
  public trackPurchase(transaction: {
    id: string;
    revenue: number;
    tax?: number;
    shipping?: number;
    items: Array<{
      id: string;
      name: string;
      category?: string;
      price: number;
      quantity: number;
      seller?: string;
    }>
  }): void {
    if (!this.isInitialized || !this.appInsights) return;
    
    // Track the overall purchase
    this.trackEvent('Purchase', {
      transactionId: transaction.id,
      revenue: transaction.revenue,
      tax: transaction.tax,
      shipping: transaction.shipping,
      itemCount: transaction.items.length
    });
    
    // Track each item purchased
    transaction.items.forEach(item => {
      this.trackEvent('PurchasedItem', {
        transactionId: transaction.id,
        productId: item.id,
        productName: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        seller: item.seller
      });
    });
  }

  /**
   * Track search events
   */
  public trackSearch(searchTerm: string): void {
    if (!this.isInitialized || !this.appInsights) return;
    
    this.trackEvent('Search', { searchTerm });
  }

  /**
   * Track user authentication
   */
  public trackUserAuthentication(userId: string, isSignup: boolean = false): void {
    if (!this.isInitialized || !this.appInsights) return;
    
    this.trackEvent(isSignup ? 'UserSignup' : 'UserLogin', { userId });
    
    // Set authenticated user context
    this.appInsights.setAuthenticatedUserContext(userId);
  }

  /**
   * Clear authenticated user context (for logout)
   */
  public clearUserContext(): void {
    if (!this.isInitialized || !this.appInsights) return;
    
    this.appInsights.clearAuthenticatedUserContext();
    this.trackEvent('UserLogout');
  }
}

export const analytics = new AppInsightsAnalytics(); 