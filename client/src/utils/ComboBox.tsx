// import Select from 'react-select';
import { Box } from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';

const options = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' },
];

export default function ComboBox() {
  return (
    <Box w={{ md: '55%' }}>
      <CreatableSelect
        isMulti
        options={options}
        placeholder='Select or type...'
      />
    </Box>
  );
}
