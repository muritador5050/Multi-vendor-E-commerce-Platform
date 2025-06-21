import React from 'react';
import { Stack, FormControl, FormLabel, Input } from '@chakra-ui/react';

const styles = {
  fontFamily: 'mono',
  fontWeight: 'semibold',
  fontSize: 'lg',
  color: 'teal.700',
  fontStyle: 'italic',
};

export default function SocialProfile() {
  return (
    <Stack>
      <FormControl {...styles}>
        <FormLabel>Titter</FormLabel>
        <Input placeholder='Twitter Handler' />
      </FormControl>
      <FormControl {...styles}>
        <FormLabel>Facebook</FormLabel>
        <Input placeholder='Facebook Handler' />
      </FormControl>
      <FormControl {...styles}>
        <FormLabel>Instagram</FormLabel>
        <Input placeholder='Instagram Username' />
      </FormControl>
      <FormControl {...styles}>
        <FormLabel>Youtube</FormLabel>
        <Input placeholder='Youtube Channel Name' />
      </FormControl>
      <FormControl {...styles}>
        <FormLabel>Linkedin</FormLabel>
        <Input placeholder='Linkedin Username' />
      </FormControl>
      <FormControl {...styles}>
        <FormLabel>Snapchat</FormLabel>
        <Input placeholder='Snapchat ID' />
      </FormControl>
      <FormControl {...styles}>
        <FormLabel>Google Plus</FormLabel>
        <Input placeholder='Google Plus Profile ID' />
      </FormControl>
    </Stack>
  );
}
