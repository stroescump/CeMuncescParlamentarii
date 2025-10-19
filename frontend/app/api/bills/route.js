export async function GET() {
  try {
    const response = await fetch('http://backend:4000/api/bills/', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from backend');
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error proxying bills:', error);
    return Response.json(
      { error: 'Failed to fetch bills' }, 
      { status: 502 }
    );
  }
}