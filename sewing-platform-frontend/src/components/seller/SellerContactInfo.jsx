import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Button 
} from '@mui/material';
import { 
  Phone as PhoneIcon, 
  Email as EmailIcon, 
  LocationOn as LocationIcon
} from '@mui/icons-material';

const SellerContactInfo = ({ seller }) => {
  const hasAddress = seller?.businessAddress && (
    seller.businessAddress.street || 
    seller.businessAddress.city || 
    seller.businessAddress.state || 
    seller.businessAddress.country
  );

  // Format address components
  const formatAddress = () => {
    if (!hasAddress) return '';
    
    const { street, city, state, zipCode, country } = seller.businessAddress;
    const parts = [];
    
    if (street) parts.push(street);
    
    let cityStateZip = '';
    if (city) cityStateZip += city;
    if (state) cityStateZip += cityStateZip ? `, ${state}` : state;
    if (zipCode) cityStateZip += cityStateZip ? ` ${zipCode}` : zipCode;
    if (cityStateZip) parts.push(cityStateZip);
    
    if (country) parts.push(country);
    
    return parts.join(', ');
  };

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List disablePadding>
          {seller?.phone && (
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PhoneIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={seller.phone} 
                secondary="Phone"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          )}
          
          {seller?.email && (
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <EmailIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={seller.email} 
                secondary="Email"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          )}
          
          {hasAddress && (
            <ListItem disableGutters alignItems="flex-start">
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LocationIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={formatAddress()} 
                secondary="Address"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          )}
        </List>
        
        {(!seller?.phone && !seller?.email && !hasAddress) && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
            This seller has not provided contact information.
          </Typography>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {seller?.phone && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              component="a"
              href={`tel:${seller.phone}`}
              startIcon={<PhoneIcon />}
            >
              Call Seller
            </Button>
          )}
          
          {seller?.email && (
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              component="a"
              href={`mailto:${seller.email}`}
              startIcon={<EmailIcon />}
            >
              Email Seller
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SellerContactInfo; 