
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nlulkbuczwfrgdfexjvn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdWxrYnVjendmcmdkZmV4anZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNzI2MzMsImV4cCI6MjA4NTg0ODYzM30.J_t8dlOk5t0yblhTWxi4r3sq9N0o8oBPBuhMWE5nLWo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking for patient_recalls table...');
  const { data, error } = await supabase
    .from('patient_recalls')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success! Table found.');
    console.log('Data sample:', data);
  }
}

checkSchema();
