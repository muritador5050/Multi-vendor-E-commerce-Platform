import React from 'react';
import {
  Box,
  Checkbox,
  Stack,
  Text,
  VStack,
  NumberInput,
  NumberInputField,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Flex,
} from '@chakra-ui/react';

interface FilterState {
  priceRange: [number, number];
  stockStatus: string[];
}

interface CategoryFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function ProductCategoryFilters({
  filters,
  onFiltersChange,
}: CategoryFiltersProps) {
  const format = (val: number) => `$${val}`;
  const parse = (val: string) => val.replace(/^\$/, '');

  // Handle slider change
  const handleSliderChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [values[0], values[1]],
    });
  };

  // Handle min price input change
  const handleMinChange = (valueString: string) => {
    const numValue = parseInt(parse(valueString)) || 5;
    const clampedValue = Math.max(
      5,
      Math.min(numValue, filters.priceRange[1] - 5)
    );
    onFiltersChange({
      ...filters,
      priceRange: [clampedValue, filters.priceRange[1]],
    });
  };

  // Handle max price input change
  const handleMaxChange = (valueString: string) => {
    const numValue = parseInt(parse(valueString)) || 650;
    const clampedValue = Math.min(
      650,
      Math.max(numValue, filters.priceRange[0] + 5)
    );
    onFiltersChange({
      ...filters,
      priceRange: [filters.priceRange[0], clampedValue],
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (
    category: keyof FilterState,
    value: string,
    checked: boolean
  ) => {
    if (category === 'priceRange') return;

    const currentValues = filters[category] as string[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value);

    onFiltersChange({
      ...filters,
      [category]: newValues,
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      priceRange: [5, 650],
      stockStatus: [],
    });
  };

  return (
    <Stack spacing={5}>
      {/* Price Filter */}
      <Box display='flex' flexDirection='column' gap={3}>
        <Text fontSize='xl' fontWeight='bold'>
          PRICE FILTER
        </Text>
        <RangeSlider
          aria-label={['min', 'max']}
          value={filters.priceRange}
          min={5}
          max={650}
          step={5}
          onChange={handleSliderChange}
        >
          <RangeSliderTrack bg='gray.500'>
            <RangeSliderFilledTrack bg='black' />
          </RangeSliderTrack>
          <RangeSliderThumb boxSize={5} borderColor='black' index={0} />
          <RangeSliderThumb boxSize={5} borderColor='black' index={1} />
        </RangeSlider>

        <Flex justifyContent='space-between'>
          <VStack>
            <NumberInput
              min={5}
              max={645}
              onChange={handleMinChange}
              value={format(filters.priceRange[0])}
            >
              <NumberInputField h={12} w={20} p={2} textAlign='center' />
            </NumberInput>
            <Text>Min. Price</Text>
          </VStack>
          <VStack>
            <NumberInput
              min={10}
              max={650}
              onChange={handleMaxChange}
              value={format(filters.priceRange[1])}
            >
              <NumberInputField h={12} w={20} p={2} textAlign='center' />
            </NumberInput>
            <Text>Max. Price</Text>
          </VStack>
        </Flex>
        <Text
          float='right'
          cursor='pointer'
          color='blue.500'
          onClick={resetFilters}
        >
          Reset
        </Text>
      </Box>

      {/* Stock Status Filter */}
      <Box>
        <Text fontSize='xl' fontWeight='bold'>
          FILTER BY STOCK STATUS
        </Text>
        <Stack direction='column'>
          <Checkbox
            isChecked={filters.stockStatus.includes('in-stock')}
            onChange={(e) =>
              handleCheckboxChange('stockStatus', 'in-stock', e.target.checked)
            }
          >
            In Stock
          </Checkbox>
          <Checkbox
            isChecked={filters.stockStatus.includes('out-stock')}
            onChange={(e) =>
              handleCheckboxChange('stockStatus', 'out-stock', e.target.checked)
            }
          >
            Out Stock
          </Checkbox>
        </Stack>
      </Box>
    </Stack>
  );
}
