import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  FormControl, 
  FormControlLabel, 
  FormGroup, 
  Grid, 
  Switch, 
  TextField, 
  Typography,
  Alert
} from '@mui/material';
import { updateSellerContact, getSellerProfile } from '../../api/seller';

const ContactDetailsForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    contactEmail: '',
    showEmail: false,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        setLoading(true);
        const response = await getSellerProfile();
        const { phone, contactEmail, businessAddress, privacySettings } = response.data.data;
        
        setFormData({
          phone: phone || '',
          contactEmail: contactEmail || '',
          showEmail: privacySettings?.showEmail || false,
          address: businessAddress || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        });
      } catch (err) {
        setError('Failed to load seller profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateSellerContact({
        phone: formData.phone,
        contactEmail: formData.contactEmail,
        showEmail: formData.showEmail,
        address: formData.address
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || 'Failed to update contact information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title="Contact Information"
          subheader="Manage your contact details shown to buyers"
        />
        <Divider />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Contact information updated successfully!
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body1" color="textSecondary" paragraph>
                Your phone number is the primary way for buyers to contact you directly.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                variant="outlined"
                helperText="International format recommended (e.g., +1234567890)"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Email (Optional)"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="contact@example.com"
                variant="outlined"
                helperText="Optional alternative contact method"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Business Address
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State/Province"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ZIP/Postal Code"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Email Visibility
                </Typography>
                {formData.contactEmail && (
                  <FormControl component="fieldset">
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.showEmail}
                            onChange={handleSwitchChange}
                            name="showEmail"
                            color="primary"
                          />
                        }
                        label="Display email address publicly (if provided)"
                      />
                    </FormGroup>
                  </FormControl>
                )}
                {!formData.contactEmail && (
                  <Typography variant="body2" color="textSecondary">
                    Add a contact email above to control its visibility.
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Contact Information'}
          </Button>
        </Box>
      </Card>
    </form>
  );
};

export default ContactDetailsForm; 