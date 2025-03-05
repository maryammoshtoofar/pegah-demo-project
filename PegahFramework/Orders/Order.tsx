﻿import * as React from 'react'
import { DateTime } from 'luxon'
import { Dic } from '@framework/Globals'
import { Navigator } from '@framework/Navigator'
import { AutoLine, EntityLine, EntityCombo, EntityList, EntityDetail, EntityStrip, EntityRepeater, TypeContext, FormGroup, FormControlReadonly, EntityTable, ChangeEvent, EnumLine } from '@framework/Lines'
import { useForceUpdate } from '@framework/Hooks'
import { getMixin } from '@framework/Signum.Entities'
import { toNumberFormat } from '@framework/Reflection'
import { AddressEmbedded, CustomerEntity } from '../Customers/PegahFramework.Customers'
import { OrderDetailEmbedded, OrderDetailMixin, OrderEntity, OrderMessage, OrderState } from './PegahFramework.Orders'

export default function Order(p: { ctx: TypeContext<OrderEntity> }): React.JSX.Element {
  const forceUpdate = useForceUpdate();
  function handleCustomerChange(c: ChangeEvent) {
    var order = p.ctx.value;
    var customer = c.newValue as CustomerEntity; //order.customer will also work
    order.shipAddress = c.newValue == null ? null! : AddressEmbedded.New({ ...customer.address });
    order.modified = true;
    forceUpdate();
  }

  function handleProductChange(detail: OrderDetailEmbedded) {
    detail.quantity = 1;
    detail.unitPrice = 0;
    forceUpdate();

    if (detail.product)
      Navigator.API.fetch(detail.product)
        .then(p => detail.unitPrice = p.unitPrice)
        .then(() => forceUpdate());
  }

  const ctx2 = p.ctx.subCtx({ labelColumns: { sm: 2 } });
  const ctx4 = p.ctx.subCtx({ labelColumns: { sm: 4 } });
  const o = ctx4.value;
  const formatNumber = toNumberFormat("0.00");

  return (
    <div>
      <div className="row">
        <div className="col-sm-6">
          <EntityLine ctx={ctx2.subCtx(o => o.customer)} onChange={handleCustomerChange} />
          <EntityDetail ctx={ctx2.subCtx(o => o.shipAddress)} />
        </div>
        <div className="col-sm-6">
          <AutoLine ctx={ctx4.subCtx(o => o.shipName)} />
          {ctx2.value.isLegacy && <AutoLine ctx={ctx4.subCtx(o => o.isLegacy)} />}
          <EnumLine ctx={ctx4.subCtx(o => o.state)} valueHtmlAttributes={{ style: { color: stateColor(o.state) } }} />
          <AutoLine ctx={ctx4.subCtx(o => o.orderDate)} helpText={ago(o.orderDate)} />
          <AutoLine ctx={ctx4.subCtx(o => o.requiredDate)} helpText={ago(o.requiredDate)} onChange={() => forceUpdate()} />
          <AutoLine ctx={ctx4.subCtx(o => o.shippedDate)} helpText={ago(o.shippedDate)} hideIfNull={true} />
          <AutoLine ctx={ctx4.subCtx(o => o.cancelationDate)} helpText={ago(o.cancelationDate)} hideIfNull={true} />
          <EntityCombo ctx={ctx4.subCtx(o => o.shipVia)} />
        </div>
      </div>
      <EntityTable ctx={ctx2.subCtx(o => o.details)} onChange={() => forceUpdate()} columns={[
        { property: a => a.product, headerHtmlAttributes: { style: { width: "35%" } }, template: dc => <EntityLine ctx={dc.subCtx(a => a.product)} onChange={() => handleProductChange(dc.value)} /> },
        { property: a => a.quantity, headerHtmlAttributes: { style: { width: "10%" } }, template: dc => <AutoLine ctx={dc.subCtx(a => a.quantity)} onChange={() => forceUpdate()} /> },
        { property: a => a.unitPrice, headerHtmlAttributes: { style: { width: "10%" } }, template: dc => <AutoLine ctx={dc.subCtx(a => a.unitPrice)} readOnly={true} /> },
        { property: a => a.discount, headerHtmlAttributes: { style: { width: "10%" } }, template: dc => <AutoLine ctx={dc.subCtx(a => a.discount)} onChange={() => forceUpdate()} /> },
        {
          header: ctx2.propertyRoute?.addLambda((o: OrderEntity) => o.details[0].element).addMixin(OrderDetailMixin, a => a.discountCode).member!.niceName,
          headerHtmlAttributes: { style: { width: "15%" } },
          template: dc => <AutoLine ctx={dc.subCtx(OrderDetailMixin).subCtx(a => a.discountCode)} onChange={() => forceUpdate()} />
        },
        {
          header: OrderMessage.SubTotalPrice.niceToString(), headerHtmlAttributes: { style: { width: "10%" } },
          template: dc =>
            <FormGroup ctx={dc}>
              {id => <div className={dc.inputGroupClass}>
                <FormControlReadonly ctx={dc} id={id}>
                  {formatNumber.format(subTotalPrice(dc.value))}
                </FormControlReadonly>
                <span className="input-group-text">€</span>
              </div>
              }
            </FormGroup>
        },
      ]} />
      <div className="row">
        <div className="col-sm-4">
          <EntityLine ctx={ctx4.subCtx(o => o.employee)} />
        </div>
        <div className="col-sm-4">
          <AutoLine ctx={ctx4.subCtx(o => o.freight)} />
        </div>
        <div className="col-sm-4">
          <FormGroup ctx={ctx4} label={OrderMessage.TotalPrice.niceToString()}>
            {id => <div className={ctx4.inputGroupClass}>
              <FormControlReadonly ctx={ctx4} id={id}>
                {formatNumber.format(ctx4.value.details.map(mle => subTotalPrice(mle.element)).sum())}
              </FormControlReadonly>
              <span className="input-group-text">€</span>
            </div>
            }
          </FormGroup>
        </div>
      </div>
    </div>
  );
}

function ago(date: string | null | undefined) {

  if (!date)
    return undefined;

  return DateTime.fromISO(date).toRelative() ?? undefined;
}

function stateColor(s: OrderState | undefined) {

  if (!s)
    return undefined;

  switch (s) {
    case "New":
    case "Ordered": return "#33cc33";
    case "Shipped": return "#0066ff";
    case "Canceled": return "#ff0000";

  }
}

function subTotalPrice(od: OrderDetailEmbedded) {
  return (od.quantity || 0) * (od.unitPrice || 0) * (1 - (od.discount || 0));
}
