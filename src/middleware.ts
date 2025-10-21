import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Se a requisição for para /api/*, fazer proxy para o backend
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // URL do backend (interno no Docker)
    const backendUrl = process.env.BACKEND_URL || 'http://backend:4000';
    
    // Construir a URL completa do backend
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, backendUrl);
    
    console.log('[MIDDLEWARE] Proxying request to backend:', url.toString());
    
    // Fazer proxy da requisição para o backend
    return NextResponse.rewrite(url);
  }
  
  // Para todas as outras rotas, continuar normalmente
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

