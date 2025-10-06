#!/bin/bash

# Fix unused error variables by replacing with underscore
find app/api -name "*.ts" -exec sed -i 's/} catch (error) {/} catch {/g' {} \;

# Fix unused request parameters
find app/api -name "*.ts" -exec sed -i 's/export async function GET(request: NextRequest)/export async function GET(_request: NextRequest)/g' {} \;

# Fix unused imports
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/import { ObjectId } from '\''mongodb'\''/\/\/ import { ObjectId } from '\''mongodb'\''/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/import { Metadata } from '\''next'\''/\/\/ import { Metadata } from '\''next'\''/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/import.*Eye.*from '\''lucide-react'\''/\/\/ &/g'

echo "ESLint fixes applied"
