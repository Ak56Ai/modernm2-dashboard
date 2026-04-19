'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/providers/AuthProvider'
import { AuthModal } from '@/components/auth/AuthModal'
import { UserMenu } from '@/components/auth/UserMenu'
import { useCartStore } from '@/lib/stores/cartStore'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { user } = useAuth()
  const { items } = useCartStore()

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-brand-secondary">ModernMart</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-brand-secondary hover:text-brand-accent transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium text-brand-secondary hover:text-brand-accent transition-colors">
              Products
            </Link>
            <Link href="/categories" className="text-sm font-medium text-brand-secondary hover:text-brand-accent transition-colors">
              Categories
            </Link>
            <Link href="/deals" className="text-sm font-medium text-brand-secondary hover:text-brand-accent transition-colors">
              Deals
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="search"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-muted/50 focus:bg-white focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-brand-accent text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <UserMenu />
            ) : (
              <Button 
                onClick={() => setIsAuthModalOpen(true)}
                variant="outline" 
                size="sm"
                className="hidden sm:flex"
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-sm font-medium text-brand-secondary hover:text-brand-accent">
                Home
              </Link>
              <Link href="/products" className="text-sm font-medium text-brand-secondary hover:text-brand-accent">
                Products
              </Link>
              <Link href="/categories" className="text-sm font-medium text-brand-secondary hover:text-brand-accent">
                Categories
              </Link>
              <Link href="/deals" className="text-sm font-medium text-brand-secondary hover:text-brand-accent">
                Deals
              </Link>
              {!user && (
                <Button 
                  onClick={() => setIsAuthModalOpen(true)}
                  variant="outline" 
                  size="sm"
                  className="w-fit"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>

      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </header>
  )
}