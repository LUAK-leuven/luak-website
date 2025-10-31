<script lang="ts" setup>
  import type { Database } from '~/types/database.types';
  import { csvHeaders } from './helpers';

  const props = defineProps<{
    data: {
      id: string;
      userId: string;
      name: string;
      email: string;
      phone_number: string | null;
      has_whatsapp: boolean;
      student: Database['public']['Enums']['student'];
      sportscard: boolean;
      kbf_uiaa_member: Database['public']['Enums']['kbf_uiaa'];
      created_at: string;
    }[];
    filename: string;
    disabled?: boolean;
  }>();

  // Export to CSV function
  const exportToCSV = () => {
    // Convert data to CSV format
    const csvData = [
      Object.keys(csvHeaders),
      ...props.data.map((row) =>
        Object.values(csvHeaders).map(
          (header) => row[header as keyof typeof row] || '',
        ),
      ),
    ];

    // Convert to CSV string
    const csvString = csvData.map((row) => row.join(',')).join('\n');

    // Create a Blob with the CSV data
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // Create a download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${props.filename}-${new Date().toISOString().split('T')[0]}.csv`,
    );

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
</script>

<template>
  <button
    class="btn btn-outline btn-sm"
    :disabled="disabled"
    @click="exportToCSV">
    <span class="material-symbols-outlined mr-1">download</span>
    Export CSV
  </button>
</template>
