// src/contacts/dto/update-contact.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateContactDto } from './create-contact.dto';

export class UpdateContactDto extends PartialType(CreateContactDto) {
    @ApiProperty({
        example: 'read',
        description: 'Estado del mensaje',
        enum: ['pending', 'read', 'replied', 'archived'],
        required: false
    })
    status?: 'pending' | 'read' | 'replied' | 'archived';
}