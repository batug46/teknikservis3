import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Test Session:', session);
    
    if (!session) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    return NextResponse.json({ 
      session: session,
      user: session.user,
      userId: session.user?.id,
      userEmail: session.user?.email,
      userName: session.user?.name
    });
  } catch (error) {
    console.error('Session test hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
} 