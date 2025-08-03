/**
 * Structured Data for Forgot Password Pages
 * Provides proper SEO metadata for password reset flow
 */

import { BRAND_NAME } from '@/lib/constants';

interface ForgotPasswordStructuredDataProps {
  page: 'forgot-password' | 'verify' | 'reset';
}

export function ForgotPasswordStructuredData({ page }: ForgotPasswordStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const getPageData = () => {
    switch (page) {
      case 'forgot-password':
        return {
          name: 'Forgot Password',
          description: 'Reset your password to regain access to your account',
          url: `${baseUrl}/forgot-password`,
        };
      case 'verify':
        return {
          name: 'Verify Reset Code',
          description: 'Enter the verification code sent to your email',
          url: `${baseUrl}/forgot-password/verify`,
        };
      case 'reset':
        return {
          name: 'Reset Password',
          description: 'Set a new password for your account',
          url: `${baseUrl}/forgot-password/reset`,
        };
      default:
        return {
          name: 'Password Reset',
          description: 'Reset your password',
          url: `${baseUrl}/forgot-password`,
        };
    }
  };

  const pageData = getPageData();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${pageData.name} - ${BRAND_NAME}`,
    description: pageData.description,
    url: pageData.url,
    isPartOf: {
      '@type': 'WebSite',
      name: BRAND_NAME,
      url: baseUrl,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Sign In',
          item: `${baseUrl}/login`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: pageData.name,
          item: pageData.url,
        },
      ],
    },
    mainEntity: {
      '@type': 'WebPageElement',
      name: `${pageData.name} Form`,
      description: pageData.description,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
