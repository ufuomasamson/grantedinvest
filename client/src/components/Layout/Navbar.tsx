import {
  Box,
  Container,
  HStack,
  VStack,
  Button,
  Text,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useBreakpointValue,
  Divider
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  onSignOut: () => void;
  isSigningOut: boolean;
}

export function Navbar({ onSignOut, isSigningOut }: NavbarProps) {
  const { user, isAdmin } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const NavButton = ({ to, children, onClick }: { to?: string; children: React.ReactNode; onClick?: () => void }) => (
    <Button
      as={to ? RouterLink : undefined}
      to={to}
      onClick={onClick}
      variant="ghost"
      color="gray.300"
      _hover={{ color: 'orange.500' }}
      w={isMobile ? "full" : "auto"}
      justifyContent={isMobile ? "flex-start" : "center"}
      size={isMobile ? "lg" : "md"}
      isLoading={onClick === onSignOut ? isSigningOut : false}
    >
      {children}
    </Button>
  );

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      height="64px"
      bg="gray.900"
      borderBottom="1px"
      borderColor="whiteAlpha.200"
      zIndex={1000}
    >
      <Container maxW="container.xl" h="100%">
        <HStack spacing={6} h="100%" justify="space-between">
          {/* Logo */}
          <Text
            as={RouterLink}
            to="/"
            fontSize="xl"
            fontWeight="bold"
            color="orange.500"
          >
            GCrypto
          </Text>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <HStack spacing={4}>
                <NavButton to="/">Home</NavButton>
                <NavButton to="/about">About</NavButton>
                <NavButton to="/services">Services</NavButton>
                <NavButton to="/contact">Contact</NavButton>

                {user && (
                  <>
                    <NavButton to="/dashboard">Dashboard</NavButton>
                    <NavButton to="/trade">Trade</NavButton>
                    <NavButton to="/market">Market</NavButton>
                  </>
                )}
              </HStack>

              <HStack spacing={4}>
                {user ? (
                  <>
                    {isAdmin && <NavButton to="/admin">Admin</NavButton>}
                    <NavButton onClick={onSignOut}>Sign Out</NavButton>
                  </>
                ) : (
                  <>
                    <NavButton to="/login">Login</NavButton>
                    <NavButton to="/register">Register</NavButton>
                  </>
                )}
              </HStack>
            </>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              variant="ghost"
              color="gray.300"
              _hover={{ color: 'orange.500' }}
              onClick={onOpen}
            />
          )}
        </HStack>
      </Container>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="gray.900">
          <DrawerCloseButton color="gray.300" />
          <DrawerHeader color="orange.500" fontSize="xl" fontWeight="bold">
            GCrypto Menu
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {/* Public Navigation */}
              <NavButton to="/" onClick={onClose}>Home</NavButton>
              <NavButton to="/about" onClick={onClose}>About</NavButton>
              <NavButton to="/services" onClick={onClose}>Services</NavButton>
              <NavButton to="/contact" onClick={onClose}>Contact</NavButton>

              {user && (
                <>
                  <Divider borderColor="gray.600" />
                  <NavButton to="/dashboard" onClick={onClose}>Dashboard</NavButton>
                  <NavButton to="/trade" onClick={onClose}>Trade</NavButton>
                  <NavButton to="/market" onClick={onClose}>Market</NavButton>
                </>
              )}

              <Divider borderColor="gray.600" />

              {user ? (
                <>
                  {isAdmin && <NavButton to="/admin" onClick={onClose}>Admin</NavButton>}
                  <NavButton onClick={() => { onSignOut(); onClose(); }}>Sign Out</NavButton>
                </>
              ) : (
                <>
                  <NavButton to="/login" onClick={onClose}>Login</NavButton>
                  <NavButton to="/register" onClick={onClose}>Register</NavButton>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}