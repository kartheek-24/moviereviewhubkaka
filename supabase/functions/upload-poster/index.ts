import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ADMIN_EMAIL = 'kakasphotography@gmail.com';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with user's auth token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (user.email !== ADMIN_EMAIL) {
      console.log('Access denied for user:', user.email);
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Received file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ 
        error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ 
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return new Response(JSON.stringify({ 
        error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for double extensions (e.g., .jpg.exe)
    const nameParts = file.name.split('.');
    if (nameParts.length > 2) {
      const suspiciousExtensions = ['exe', 'bat', 'sh', 'cmd', 'ps1', 'js', 'html', 'php'];
      for (const part of nameParts.slice(0, -1)) {
        if (suspiciousExtensions.includes(part.toLowerCase())) {
          return new Response(JSON.stringify({ 
            error: 'Suspicious file name detected' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Read file as array buffer for magic bytes validation
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Validate magic bytes (first few bytes of file)
    const isValidImage = validateImageMagicBytes(uint8Array, file.type);
    if (!isValidImage) {
      return new Response(JSON.stringify({ 
        error: 'File content does not match declared type' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate safe filename
    const safeFileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

    // Create admin client for storage upload (bypasses RLS for this controlled operation)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upload to storage
    const { error: uploadError } = await adminClient.storage
      .from('posters')
      .upload(safeFileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to upload file' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('posters')
      .getPublicUrl(safeFileName);

    console.log('Upload successful:', publicUrl);

    return new Response(JSON.stringify({ 
      success: true,
      url: publicUrl,
      fileName: safeFileName 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Validate image magic bytes
function validateImageMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  if (bytes.length < 8) return false;

  // JPEG: starts with FF D8 FF
  if (mimeType === 'image/jpeg') {
    return bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  }

  // PNG: starts with 89 50 4E 47 0D 0A 1A 0A
  if (mimeType === 'image/png') {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
           bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A;
  }

  // GIF: starts with GIF87a or GIF89a
  if (mimeType === 'image/gif') {
    return bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 &&
           (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61;
  }

  // WebP: starts with RIFF....WEBP
  if (mimeType === 'image/webp') {
    return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
           bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  }

  return false;
}
