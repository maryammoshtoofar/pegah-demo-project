﻿import * as React from 'react'
import { AutoLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, CheckboxLine } from '@framework/Lines'
import SearchControl from '@framework/SearchControl/SearchControl';
import * as Reflection from '@framework/Reflection';
import { OrderEntity } from '../Orders/PegahFramework.Orders';
import { PersonEntity } from './PegahFramework.Customers';
import { CorruptMixin, getMixin } from '@framework/Signum.Entities';

export default function Person(p : { ctx: TypeContext<PersonEntity> }): React.JSX.Element {
  const ctx = p.ctx;
  const ctxBasic = ctx.subCtx({ formGroupStyle: "Basic" });
  return (
    <div>
      {getMixin(ctx.value, CorruptMixin).corrupt && <CheckboxLine ctx={ctx.subCtx(CorruptMixin).subCtx(p => p.corrupt)} inlineCheckbox={true} />}
      <div className="row">
        <div className="col-sm-2">
          <AutoLine ctx={ctxBasic.subCtx(p => p.title)} />
        </div>
        <div className="col-sm-4">
          <AutoLine ctx={ctxBasic.subCtx(p => p.firstName)} />
        </div>
        <div className="col-sm-4">
          <AutoLine ctx={ctxBasic.subCtx(p => p.lastName)} />
        </div>
        <div className="col-sm-2">
          <AutoLine ctx={ctxBasic.subCtx(p => p.dateOfBirth)} />
        </div>
      </div>

      <h2 className="mt-4">{OrderEntity.nicePluralName()}</h2>
      <SearchControl findOptions={{
        queryName: OrderEntity,
        filterOptions: [{ token: "Customer", value: ctx.value}] 
      }} showSimpleFilterBuilder={false} />
    </div>
  );
}
