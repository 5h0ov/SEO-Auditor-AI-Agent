'use client';

import { useState, useEffect, useRef } from 'react';
import { useGitHubStore } from '@/lib/store/github-store';
import { toast } from 'sonner';
import { env } from '@/env';

export function useGitHubConnection() {
  const { integration, setAccessToken, disconnect } = useGitHubStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const hasProcessedCallback = useRef(false);

  useEffect(() => {
    setIsConnected(!!integration?.accessToken);
  }, [integration]);

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash;
      if (!hash) return;

      const params = new URLSearchParams(hash.substring(1));
      const code = params.get('code');
      const error = params.get('error');

      if (hasProcessedCallback.current) {
        return;
      }

      if (error) {
        hasProcessedCallback.current = true;
        toast.error(`GitHub authorization failed: ${error}`);
        // cleanup url
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code && code.length > 0) {
        hasProcessedCallback.current = true;
        setIsConnecting(true);
        try {
          const response = await fetch('/api/github/exchange-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to exchange code for token');
          }

          const { access_token } = await response.json();

          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${access_token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });

          if (!userResponse.ok) {
            throw new Error('Failed to fetch user information');
          }

          const userData = await userResponse.json();

          // store encrypted token
          await setAccessToken(access_token, userData.login);

          toast.success(`Connected as ${userData.login}`);

          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('GitHub connection error:', error);
          // toast.error('Failed to connect to GitHub');
        } finally {
          setIsConnecting(false);
        }
      }
    };

    handleCallback();
  }, [setAccessToken]);

  const handleConnect = () => {
    hasProcessedCallback.current = false;

    const clientId = env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${env.NEXT_PUBLIC_APP_URL}/api/github/callback`;
    const scope = 'repo,user:email';

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    window.location.href = authUrl;
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success('Disconnected from GitHub');
  };

  return {
    integration,
    isConnected,
    isConnecting,
    handleConnect,
    handleDisconnect,
  };
}
