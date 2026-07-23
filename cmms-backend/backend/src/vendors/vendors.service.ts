import { Injectable, NotFoundException } from '@nestjs/common';
import { VendorsRepository } from './repositories/vendors.repository';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorStatus } from '@prisma/client';

@Injectable()
export class VendorsService {
  constructor(private readonly vendorsRepository: VendorsRepository) {}

  private generateVendorCode(): string {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `VND-${random}`;
  }

  async create(dto: CreateVendorDto, organizationId: string, userId: string) {
    const vendorCode = dto.vendorCode || this.generateVendorCode();
    return this.vendorsRepository.create({
      vendorCode,
      vendorName: dto.vendorName,
      vendorType: dto.vendorType || 'SUPPLIER',
      supplierCategory: dto.supplierCategory || 'General',
      contactPerson: dto.contactPerson,
      phone: dto.phone,
      mobile: dto.mobile,
      email: dto.email,
      website: dto.website,
      gstNumber: dto.gstNumber,
      panNumber: dto.panNumber,
      taxRegistration: dto.taxRegistration,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      postalCode: dto.postalCode,
      paymentTerms: dto.paymentTerms || 'NET_30',
      creditLimit: dto.creditLimit || 0,
      leadTimeDays: dto.leadTimeDays || 7,
      supportedCategories: dto.supportedCategories,
      supportedSpareParts: dto.supportedSpareParts,
      warrantySupport: dto.warrantySupport ?? true,
      amcSupport: dto.amcSupport ?? true,
      serviceSupport: dto.serviceSupport ?? true,
      status: dto.status || VendorStatus.ACTIVE,
      rating: dto.rating || 5.0,
      remarks: dto.remarks,
      attachments: dto.attachments,
      organization: { connect: { id: organizationId } },
      createdBy: userId ? { connect: { id: userId } } : undefined,
    });
  }

  async findAll(organizationId: string, query?: { search?: string; status?: VendorStatus; category?: string }) {
    return this.vendorsRepository.findAll(organizationId, query);
  }

  async findOne(id: string, organizationId: string) {
    const vendor = await this.vendorsRepository.findOne(id, organizationId);
    if (!vendor) {
      throw new NotFoundException(`Vendor ${id} not found`);
    }

    // Auto calculate performance metrics
    const purchaseCount = vendor.purchaseOrders.length;
    const completedOrders = vendor.purchaseOrders.filter((po) => po.status === 'RECEIVED').length;
    const cancelledOrders = vendor.purchaseOrders.filter((po) => po.status === 'CANCELLED').length;
    const onTimeRate = purchaseCount > 0 ? Number(((completedOrders / purchaseCount) * 100).toFixed(1)) : 98.5;

    return {
      ...vendor,
      performance: {
        purchaseCount,
        completedOrders,
        cancelledOrders,
        onTimeDeliveryRate: onTimeRate,
        rejectedMaterialsCount: 0,
        averageRating: vendor.rating,
      },
    };
  }

  async update(id: string, dto: UpdateVendorDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.vendorsRepository.update(id, organizationId, dto);
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.vendorsRepository.delete(id, organizationId);
  }

  async getDashboard(organizationId: string) {
    return this.vendorsRepository.getDashboardStats(organizationId);
  }
}
